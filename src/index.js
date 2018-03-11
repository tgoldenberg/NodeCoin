import 'babel-polyfill';
import 'colors';

import { connectWithPeer, isNodeSynced } from './connectWithPeer';
import { getAddress, makeWallet } from './address';
import { getWalletData, getWallets } from 'utils/getWalletData';
import { isValidBlock, isValidTransaction, syncBlocksWithStore } from 'db/syncBlocksWithStore';

import BlockModel from 'models/Block';
import Client from 'pusher-js';
import SHA256 from 'js-sha256';
import axios from 'axios';
import bodyParser from 'body-parser';
import connectToDB from './connectToDB';
import express from 'express';
import find from 'lodash/find';
import findIPAddress from 'utils/findIPAddress';
import ip from 'ip';
import net from 'net';
import { seedBlocks } from '__mocks__/blocks';
import { startMining } from 'mining/startMining';
import store from 'store/store';
import uniq from 'lodash/uniq';
import { unlockTransaction } from 'utils/validateSignature';
import { wait } from 'utils';

const request = axios.create({
  validateStatus: (status) => true,
  responseType: 'json',
  timeout: 10000,
});

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PUSHER_APP_KEY = '86e36fb6cb404d67a108'; // connect via public key
const COIN = 100000000;
const DEFAULT_PORT = 8334; // default port for net connections
const MAX_PEERS = 25;
const DELIMITER = '~~~~~';
const MIN_TX_PER_BLOCK = 2;

let reg = new RegExp(DELIMITER, 'gi');



function handleConnection(conn) {
  const remoteAddr = `${conn.remoteAddress}:${conn.remotePort}`;
  const [ ip, port ] = remoteAddr.split(':');
  console.log(`> New client connection from ${remoteAddr}`.blue);
  // PEER CONNECTED
  store.dispatch({
    type: 'CONNECT_PEER',
    client: conn,
    ip,
    port,
  });

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
          break;
        }
        store.dispatch({ type: 'SYNC_PEER', ip: ip });
        await isNodeSynced();
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
        break;
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

  // curl -XPOST localhost:3000/send -d publicKey=044283eb5f9aa7421f646f266fbf5f7a72b7229a7b90a088d1fe45292844557b1d80ed9ac96d5b3ff8286e7794e05c28f70ae671c7fecd634dd278eb0373e6a3ba -d amount=10 -d privateKey=0fcb37c77f68a69b76cd5b160ac9c85877b4e8a09d8bcde2c778715c27f9a347 -d toAddress=0482a39675cdc06766af5192a551b703c5090fc67f6e403dfdb42b60d34f5e3539ad44de9197e7ac09d1db5a60f79552ce5c7984a3fc4643fb1911f3857d6dd34c | python -m json.tool
  app.post('/send', async function (req, res) {
    let { amount, privateKey, publicKey, toAddress } = req.body;
    if (!amount || !privateKey || !publicKey || !toAddress) {
      return res.status(500).send({ error: 'Missing parameters [amount|privateKey|publicKey|toAddress]'});
    }
    if (typeof amount === 'string') {
      amount = parseInt(amount);
    }
    let address = getAddress(publicKey);
    let walletData = await getWalletData(address);
    let { utxo, balance } = walletData;
    utxo = utxo.sort((a, b) => a.nValue < b.nValue);
    // is transaction less than balance?
    let isLessThanBalance = balance > amount;
    if (!isLessThanBalance) {
      return res.status(500).send({ error: 'Balance must be above amount to send.' });
    }
    let remaining = amount;
    let vin = [ ];
    let vout = [ ];
    let spentTxs = [ ];
    // get rid of spare change
    for (let i = 0; i < utxo.length; i++) {
      let tx = utxo[i];

      let remainder = tx.nValue - remaining;
      let spent = Math.min(remaining, tx.nValue);
      remaining -= spent;
      spentTxs.push(tx);
      vin.push({
        prevout: tx.txid,
        n: tx.n,
        scriptSig: unlockTransaction(tx.msg, publicKey, privateKey),
      });
      vout.push({
        scriptPubKey: `${tx.txid} ${toAddress}`,
        nValue: spent,
      });
      if (remainder > 0) {
        // add vout to self of remaining
        vout.push({
          scriptPubKey: `${tx.txid} ${publicKey}`,
          nValue: remainder,
        });
        break;
      }
    }
    let transaction = {
      hash: SHA256(JSON.stringify(vin) + JSON.stringify(vout)),
      vin,
      vout,
    };
    // broadcast to network
    // let url = 'http://localhost:3001/transaction';
    let url = 'https://pusher-presence-auth.herokuapp.com/transactions/new';
    let body = {
      tx: transaction,
      timestamp: Date.now(),
    };
    let response = await request.post(url, body);
    console.log('> Send transaction response: '.yellow, response.data);
    res.status(200).send(response.data);
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

  app.post('/blocks/new', async function(req, res) {
    console.log('> New block: ', req.body);
    const { hash, version, previousHash, merkleHash, timestamp, difficulty, nonce, txs, blocksize } = req.body;
    // validate block format
    let newBlock = new BlockModel(req.body);
    let prevBlock = await BlockModel.findOne({ }).sort({ timestamp: -1 }).limit(1);
    const isValid = await isValidBlock(newBlock, prevBlock);
    if (isValid) {
      // broadcast to network
      res.status(200).send({ sent: true, block: req.body });
    } else {
      res.status(500).send({ error: 'Block is not valid.' });
    }
  })

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
      // authEndpoint: 'http://localhost:3001/pusher/auth',
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
          allPeers.push({
            ip: member.id,
            synced: false,
            connected: false,
            client: null
          });
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
      allPeers.push({
        ip: member.id,
        connected: false,
        client: null,
        synced: false
      });
      store.dispatch({ type: 'SET_PEERS', allPeers });
      let lastBlock = store.getState().lastBlock;
      let lastBlockHash = lastBlock.getBlockHeaderHash();
      let version = lastBlock.header.version;
      // TODO: send ping to new member to exchange headers
      // wait 30 seconds before initiating connection
      setTimeout(async () => {
        let allPeers = store.getState().allPeers;
        let peer = find(allPeers, ({ ip }) => ip === member.id);
        if (!peer.connected) {
          await connectWithPeer({ ip: member.id }, lastBlockHash, version);
        }
      }, 10 * 1000);
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

    channel.bind('transaction:new', async (data) => {
      console.log('> transaction:new: ', data.tx.hash);
      // validate transaction
      const isValid = await isValidTransaction(data.tx);
      if (isValid) {
        // add to memory pool of valid transactions
        store.dispatch({ type: 'NEW_TX', tx: data.tx });
        await isNodeSynced();
      } else {
        console.log('> Invalid tx: ', data.tx.hash);
      }
    });

    channel.bind('block:new', async (data) => {
      console.log('> block:new: ', data);
      // is local node synced?
      const isSynced = await isNodeSynced();
      // validate block
      const lastBlock = await BlockModel.findOne({ }).sort({ timestamp: -1 }).limit(1);
      const isValid = await isValidBlock(data.block, lastBlock);
      console.log('> Is valid block: ', isValid)
      // add block to MongoDB and local state as "lastBlock"
      // stop mining operation
      // start operating for next block
      await startMining();
    });
  });
}

startup();
