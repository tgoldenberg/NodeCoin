require('dotenv').config();

const Client = require('pusher-js');
const _ = require('lodash');
const express = require('express');
const ip = require('ip');
const flatfile = require('flat-file-db');
const app = express();
const createAddress = require('./address');
const net = require('net');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get current IP address in use
const ipAddr = ip.address();

const PUSHER_APP_KEY = '86e36fb6cb404d67a108';

// pull most recent version of blockchain saved
const db = flatfile.sync('/tmp/node-coin.db');
const wholeChain = db.get('whole_chain');
const coinAddress = db.get('public_address');

function handleConnection(conn) {
  const remoteAddr = `${conn.remoteAddress}:${conn.remotePort}`;
  console.log(`> new client connection from ${remoteAddr}`);

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

app.listen(process.env.PORT || 3000, function() {
  console.log('> Server listening on port ', process.env.PORT, ipAddr);

  // create a TCP/IP server on current IP address
  const server = net.createServer();
  server.on('connection', handleConnection);

  server.listen(8334, function() {
    console.log(`> Server listening to : ${JSON.stringify(server.address())}`);
  });

  // initialize presence channel via Pusher
  var client = new Client(PUSHER_APP_KEY, {
    auth: { params: { ip_addr: ipAddr, port: 8334 } },
    cluster: 'us2',
    authEndpoint: 'https://pusher-presence-auth.herokuapp.com/pusher/auth',
    encrypted: true
  });

  console.log('> Subscribing to changes...');
  var channel = client.subscribe('presence-node-coin');

  // called when the client successfully joins group
  channel.bind('pusher:subscription_succeeded', function (members) {
    console.log('> Subscription succeeded: ', members);
    let hitMe = false;
    channel.members.each(function(member) {
      // pick member and ask for block headers
      console.log('> Member: ', member);
    });
  });

  channel.bind('pusher:member_added', function(member){
    console.log('> Member added: ', member);
    // send ping to new member to exchange headers
  });

  channel.bind('pusher:member_removed', function(member){
    console.log('> Member removed: ', member);
  });

  channel.bind('blocks:request_blocks', function(data) {
    console.log('> Request for blocks: ', data);
    if (data.ip_addr !== ipAddr) {
      // check if has block after last block
      console.log('> Find missing blocks...');
    }
  })
});
