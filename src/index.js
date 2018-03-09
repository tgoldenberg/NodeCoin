import 'colors';
import 'babel-polyfill';

import { getAddress, makeWallet } from './address';
import { getWalletData, getWallets } from 'utils/getWalletData';

import BlockModel from 'models/Block';
import Client from 'pusher-js';
import bodyParser from 'body-parser';
import connectToDB from './connectToDB';
import connectWithPeer from './connectWithPeer';
import express from 'express';
import find from 'lodash/find';
import findIPAddress from 'utils/findIPAddress';
import ip from 'ip';
import { lockTransaction } from 'utils/validateSignature';
import mongoose from 'mongoose';
import net from 'net';
import network from 'network';
import { seedBlocks } from '__mocks__/blocks';
import store from 'store/store';
import syncBlocksWithStore from 'db/syncBlocksWithStore';
import { wait } from 'utils';

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PUSHER_APP_KEY = '86e36fb6cb404d67a108'; // connect via public key
const COIN = 100000000;
const DEFAULT_PORT = 8334; // default port for net connections
const MAX_PEERS = 25;
const DELIMITER = '~~~~~';

let reg = new RegExp(DELIMITER, 'gi');

function handleConnection(conn) {
  const remoteAddr = `${conn.remoteAddress}:${conn.remotePort}`;
  console.log(`> New client connection from ${remoteAddr}`.blue);

  conn.setEncoding('utf8');
  conn.on('data', onConnData);
  conn.on('close', onConnClose);
  conn.on('error', onConnError);

  async function onConnData(d) {
    let [ type, ...args ] = d.split(DELIMITER);
    console.log(`> Received from: ${remoteAddr} `.yellow, d.replace(reg, ' '));
    let version, lastBlockHash, state, lastBlock, peerLastBlock;
    let blockHeaderHash, blocksToSend, message;
    let allPeers, unfetchedHeaders, peerIdx, headers, header, block;
    switch(type) {
      // Initial message swapping version numbers and last block header hash
      case 'VERSION':
        [ version, lastBlockHash ] = args;
        lastBlock = store.getState().lastBlock;
        conn.write([ 'VERSION', lastBlock.header.version, lastBlock.getBlockHeaderHash() ].join(DELIMITER));

        // Check if we have the last block header transmitted
        peerLastBlock = await BlockModel.findOne({ hash: lastBlockHash });
        if (!peerLastBlock) { // send getblocks message
          conn.write([ 'GETBLOCKS', lastBlock.getBlockHeaderHash() ].join(DELIMITER));
        }
        break;
      // Peer asks for our latest blocks
      case 'GETBLOCKS':
        blockHeaderHash = args[0];
        lastBlock = await BlockModel.findOne({ hash: blockHeaderHash });
        if (!!lastBlock) {
          blocksToSend = await BlockModel.find({ timestamp: { $gte: lastBlock.timestamp } }).limit(50);
          message = ['BLOCKHEADERS', ...blocksToSend.map(blk => blk.hash) ].join(DELIMITER);
          conn.write(message);
        }
        break;
      // Peer sends us list of block headers
      case 'BLOCKHEADERS':
        // add to unfetchedHeaders
        store.dispatch({ type: 'ADD_UNFETCHED_HEADERS', headers: args });
        let { allPeers, unfetchedHeaders } = store.getState();
        headers = Array.from(unfetchedHeaders);
        peerIdx = 0;
        while (headers.length) {
          // assign header to peer
          let peer = allPeers[peerIdx];
          // connect with peer if no connection
          if (!peer.client) {
            // await connectWithPeer(peer, lastBlockHash, version);
          }
          let header = headers.shift(); // dequeue a header
          conn.write(`REQUESTBLOCK${DELIMITER}` + header);
          await wait(1); // wait 1 second
          // if peer doesn't respond within a period or doesn't have the block, move to next peer
          // if peer gives block, verify the block (if possible) and add to MongoDB

          // move from unfetched => loading
          store.dispatch({ type: 'LOADING_BLOCK', header });
          peerIdx = allPeers.length % (peerIdx + 1);
        }
        break;
      case 'REQUESTBLOCK':
        // find the requested block and send as a JSON-serialized string
        header = args[0];
        block = await BlockModel.findOne({ hash: header });
        if (block) {
          conn.write(`SENDBLOCK${DELIMITER}` + JSON.stringify(block));
        }
    }
  }
  function onConnClose() {
    console.log('connection from %s closed', remoteAddr);
  }
  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddr, err.message);
  }
}

let allPeers = [ ];

function startup() {

  // curl -XGET localhost:3000/wallets | python -m json.tool
  app.get('/wallets', async function (req, res) {
    // go through all block transactions (txin that is not Coinbase)
    let wallets = await getWallets();
    res.status(200).send({ wallets });
  });

  app.post('/send/:to_address', async function (req, res) {
    const { amount, privateKey, publicKey } = req.body;
    let address = getAddress(publicKey);
    let walletData = await getWalletData(address);
    let { utxo, balance } = walletData;
    utxo = utxo.sort((a, b) => a.nValue < b.nValue);
    // is transaction less than balance?
    let isLessThanBalance = balance > amount;
    if (!isLessThanBalance) {
      res.status(500).send({ error: 'Balance must be above amount to send.' });
    }
    let remaining = amount;
    // get rid of spare change
    for (let i = 0; i < utxo.length; i++) {
      remaining -= utxo.nValue;
    }
    let vin = [ ]
    let vout = [ { nValue: amount, scriptPubKey: lockTransaction() }]
    // let txid = SHA256(amount + req.params.to_address + );
    let transaction = {
      vin: [ ],
      vout: [ { scriptPubKey: `${req.params.to_address}`}],
    }
    res.status(200).send({ transaction: { amount: amount } });
  });

  // curl -XPOST localhost:3000/wallets/new | python -m json.tool
  app.post('/wallets/new', async function(req, res) {
    // generate new wallet and provide to user
    let wallet = await makeWallet();
    res.status(200).send({ wallet });
  });

  // curl -XGET localhost:3000/wallets/1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M | python -m json.tool
  app.get('/wallets/:address', async function (req, res) {
    let walletData = await getWalletData(req.params.address);
    let { utxo, balance } = walletData;
    res.status(200).send({ wallet: { balance }, utxo: utxo });
  });

  app.listen(process.env.PORT || 3000, async function() {
    const ipAddr = await findIPAddress();
    console.log('> Server listening on port '.gray, process.env.PORT, ipAddr);

    // connect to local instance of MongoDB
    const dbConnection = await connectToDB();
    console.log('> Connected to local MongoDB'.gray);

    // seed blocks
    if (process.env.SEED_BLOCKS === 'true') {
      await seedBlocks();
    }

    // create a TCP/IP server on current IP address
    const server = net.createServer();
    server.on('connection', handleConnection);

    server.listen(DEFAULT_PORT, '0.0.0.0', function() {
      console.log(`> TCP/IP server listening on:`.gray, JSON.stringify(server.address()));
    });

    // initialize presence channel via Pusher
    const client = new Client(PUSHER_APP_KEY, {
      auth: { params: { ip_addr: ipAddr, port: 8334 } },
      cluster: 'us2',
      authEndpoint: 'https://pusher-presence-auth.herokuapp.com/pusher/auth',
      encrypted: true
    });

    // initialize blockchain (MongoDB local)
    const { numBlocks, lastBlock } = await syncBlocksWithStore();

    console.log('> Subscribing to broadcast changes...'.gray);
    const channel = client.subscribe('presence-node-coin');

    // SUCCESSFULLY JOINED
    channel.bind('pusher:subscription_succeeded', async (members) => {
      console.log('> Subscription succeeded: ', members);
      allPeers = [ ];
      channel.members.each(member => {
        if (member.id !== ipAddr) {
          allPeers.push({ ip: member.id });
        }
      });
      allPeers = allPeers.slice(0, MAX_PEERS);
      // console.log('> All peers: ', allPeers);
      store.dispatch({ type: 'SET_PEERS', allPeers });
      let lastBlock = store.getState().lastBlock;
      let lastBlockHash = lastBlock.getBlockHeaderHash();
      let version = lastBlock.header.version;
      // console.log('> Last block hash: ', version, lastBlockHash);

      // send version message to all peers, w/ version and last block hash
      for (let i = 0; i < allPeers.length; i++) {
        const peer = allPeers[i];
        await connectWithPeer(peer, lastBlockHash, version);
      }
    });

    // MEMBER ADDED
    channel.bind('pusher:member_added', async function(member) {
      console.log('> Member added: '.gray, member);
      let allPeers = store.getState().allPeers;
      allPeers.push({ ip: member.id });
      store.dispatch({ type: 'SET_PEERS', allPeers });
      let lastBlock = store.getState().lastBlock;
      let lastBlockHash = lastBlock.getBlockHeaderHash();
      let version = lastBlock.header.version;
      // TODO: send ping to new member to exchange headers
      // wait 30 seconds before initiating connection
      // await connectWithPeer({ ip: member.id }, lastBlockHash, version);
    });

    // MEMBER REMOVED
    channel.bind('pusher:member_removed', function(member){
      console.log('> Member removed: ', member);
      let allPeers = store.getState().allPeers;
      let newAllPeers = [ ];
      allPeers.forEach(peer => {
        if (peer.ip !== member.id) {
          newAllPeers.push(peer);
        }
      });
      store.dispatch({ type: 'SET_PEERS', allPeers: newAllPeers });
      // TODO: stop any ongoing requests with peer
    });
  });
}

startup();
