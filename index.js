require('dotenv').config();

const Client = require('pusher-js');
const express = require('express');
const ip = require('ip');
const flatfile = require('flat-file-db');
const app = express();
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
const lastBlock = db.get('last_block');
const firstBlock = db.get('first_block')
const wholeChain = db.get('whole_chain');

// create a TCP/IP server on current IP address
const netServer = net.createServer(function(socket) {
  socket.pipe(socket);
});

netServer.listen(1337, ipAddr);

app.listen(3000, function() {
  console.log('> Server listening on port 3000...', ipAddr);

  // initialize blockchain if not saved locally
  var blockchain = typeof wholeChain === 'object' ? wholeChain : new Blockchain();
  db.put('firstBlock', null);
  db.put('lastBlock', null);
  db.put('wholeChain', blockchain);

  console.log('> Initializing blockchain...', blockchain.tail.hash);

  // initialize presence channel via Pusher
  var client = new Client(PUSHER_APP_KEY, {
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
      if (hitMe) {
        // found next IP address - set up server to listen and send messages
        const netClient = new net.Socket();
        netClient.connect(1337, member.id, function() {
          netClient.write(blockchain.tail.hash);
        });
        netClient.on('data', function(data) {
          console.log('> Received: ', data.toString());
        })
      }
      if (member.id === ipAddr) {
        hitMe = true;
      }
    });
  });

  channel.bind('pusher:member_added', function(member){
    console.log('> Member added: ', member);
    let hitMe = false;
    channel.members.each(function(member) {
      if (hitMe) {
        // found next IP address - set up server to listen and send messages
        const netClient = new net.Socket();
        netClient.connect(1337, member.id, function() {
          console.log('> connected to new member: ', member.id);
        });
        netClient.on('data', function(data) {
          console.log('> Received: ', data.toString());
        })
      }
      if (member.id === ipAddr) {
        hitMe = true;
      }
    });
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
