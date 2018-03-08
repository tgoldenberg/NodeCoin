import 'colors';
import 'babel-polyfill';

import Client from 'pusher-js';
import _ from 'lodash';
import bodyParser from 'body-parser';
import connectToDB from './connectToDB';
import connectWithPeer from './connectWithPeer';
import express from 'express';
import findIPAddress from 'utils/findIPAddress';
import ip from 'ip';
import mongoose from 'mongoose';
import net from 'net';
import network from 'network';
import { seedBlocks } from '__mocks__/blocks';
import store from 'store/store';
import syncBlocksWithStore from 'db/syncBlocksWithStore';

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get current IP address in use
// const ipAddr = ip.address();
// const ipAddr = '192.168.1.150';

const PUSHER_APP_KEY = '86e36fb6cb404d67a108'; // connect via public key
const DEFAULT_PORT = 8334; // default port for net connections
const MAX_PEERS = 25;

function handleConnection(conn) {
  const remoteAddr = `${conn.remoteAddress}:${conn.remotePort}`;
  console.log(`> New client connection from ${remoteAddr}`.blue);

  conn.setEncoding('utf8');
  conn.on('data', onConnData);
  conn.on('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    let [ type, ...args ] = d.split(' ');
    console.log(`> Connection data from: ${remoteAddr}`, d);
    let version, lastBlockHash, state, lastBlock;
    switch(type) {
      case 'VERSION':
        version = args[0];
        lastBlockHash = args[1];
        state = store.getState();
        lastBlock = state.lastBlock;
        console.log('> Responding to VERSION request');
        conn.write([ 'VERSION', lastBlock.header.version, lastBlock.getBlockHeaderHash() ].join(' '));
        break;
      case 'GETBLOCKS':
        console.log('> Get Blocks: ', d);
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
  app.listen(process.env.PORT || 3000, async function() {
    const ipAddr = await findIPAddress();
    console.log('> Server listening on port '.gray, process.env.PORT, ipAddr);

    // connect to local instance of MongoDB
    const dbConnection = await connectToDB();
    console.log('> Connected to local MongoDB'.gray);

    // seed blocks
    await seedBlocks();

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
    channel.bind('pusher:member_added', function(member){
      let allPeers = store.getState().allPeers;
      allPeers.push({ ip: member.id });
      store.dispatch({ type: 'SET_PEERS', allPeers });
      // TODO: send ping to new member to exchange headers
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
