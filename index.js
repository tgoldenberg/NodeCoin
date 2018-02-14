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

app.listen(process.env.PORT || 3000, function() {
  console.log('> Server listening on port ', process.env.PORT, ipAddr);
  // create a TCP/IP server on current IP address
  const netServer = net.createServer(function(socket) {
    socket.pipe(socket);
  });

  netServer.listen(1337, '127.0.0.1');

  // check every 10 minutes if IP address has changes
  setInterval(function() {
    let newIpAddr = ip.address();
    if (newIpAddr !== ipAddr) {
      console.log('> Update IP address: ', newIpAddr);
    }
  }, 10 * 1000 * 60);

  // initialize blockchain if not saved locally
  var blockchain = new Blockchain(wholeChain);
  db.put('wholeChain', blockchain);

  console.log('> Initializing blockchain...', blockchain.transactions[blockchain.transactions.length - 1].hash);

  // initialize presence channel via Pusher
  var client = new Client(PUSHER_APP_KEY, {
    auth: {
      params: {
        ip_addr: ipAddr,
      }
    },
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
          // TODO: take last 50 blocks and add to blockchain
        });
        hitMe = false;
      }
      if (member.id === ipAddr) {
        hitMe = true;
      }
    });

    let publicAddress = process.argv[2];
    console.log('> Current addresses: ', blockchain.addresses);
    if (publicAddress) {
      if (_.has(blockchain.addresses, publicAddress)) {
        blockchain.me = publicAddress;
      } else {
        throw new Error('Provided address is not registered.');
      }
    } else {
      if (coinAddress) {
        if (_.has(blockchain.addresses, coinAddress)) {
          blockchain.me = coinAddress;
        } else {
          throw new Error('Provided address is not registered.');
        }
      } else {
        // generate new address and confirm in blockchain
        let address = createAddress('BTC');
        let block = blockchain.registerAddress(address);
        // save address to Blockchain
        blockchain.me = address.publicAddress;
        // broadcast new block
        channel.members.each(function(member) {
          // found next IP address - set up server to listen and send messages
          if (member.id !== ipAddr) {
            const netClient = new net.Socket();
            netClient.connect(1337, member.id, function() {
              console.log('> Connected to: ', member.id);
              netClient.write('> New block: ' + JSON.stringify(block));
            });
            netClient.on('data', function(data) {
              console.log('> Received: ', data.toString());
              // compare with current blockchain and set whichever is longest
            });
          }
        });
      }
    }
    console.log('> My address: ', blockchain.me);
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
          netClient.write('> Latest chain: ' + blockchain.tail.hash);
        });
        hitMe = false;
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
