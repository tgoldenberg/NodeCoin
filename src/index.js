import 'colors';
import 'babel-polyfill';

import Client from 'pusher-js';
import _ from 'lodash';
import bodyParser from 'body-parser';
import connectToDB from './connectToDB';
import express from 'express';
import ip from 'ip';
import mongoose from 'mongoose';
import net from 'net';
import store from 'store/store';
import syncBlocksWithStore from 'db/syncBlocksWithStore';

require('dotenv').config();


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get current IP address in use
const ipAddr = ip.address();

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
    console.log(`> Connection data from: ${remoteAddr}`, d);
    conn.write(d);
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
    console.log('> Server listening on port '.gray, process.env.PORT, ipAddr);

    // connect to local instance of MongoDB
    const dbConnection = await connectToDB();
    console.log('> Connected to local MongoDB'.gray);

    // create a TCP/IP server on current IP address
    const server = net.createServer();
    server.on('connection', handleConnection);

    server.listen(8334, function() {
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

    // called when the client successfully joins group
    channel.bind('pusher:subscription_succeeded', function (members) {
      console.log('> Subscription succeeded: ', members);
      allPeers = [ ];
      channel.members.each(function(member) {
        allPeers.push({ ip: member.id });
      });
      allPeers = allPeers.slice(0, MAX_PEERS);
      console.log('> All peers: ', allPeers);
      store.dispatch({ type: 'SET_PEERS', allPeers });
      // send version message to all peers, w/ version and last block hash
      let lastBlock = store.getState().lastBlock;
      let lastBlockHash = lastBlock.getBlockHeaderHash();
      let version = lastBlock.version;
      console.log('> Last block hash: ', version, lastBlockHash);
    });

    channel.bind('pusher:member_added', function(member){
      console.log('> Member added: ', member);
      // send ping to new member to exchange headers
      allPeers.push({ ip: member.id });
    });

    channel.bind('pusher:member_removed', function(member){
      console.log('> Member removed: ', member);
      let newAllPeers = [ ];
      allPeers.forEach(peer => {
        if (peer.ip !== member.id) {
          newAllPeers.push(peer);
        }
      });
      allPeers = newAllPeers;
    });

    channel.bind('blocks:request_blocks', function(data) {
      console.log('> Request for blocks: ', data);
      if (data.ip_addr !== ipAddr) {
        // check if has block after last block
        console.log('> Find missing blocks...');
      }
    })
  });
}

startup();
