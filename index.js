require('dotenv').config();

const Socket = require('pusher');
const Client = require('pusher-js');
const express = require('express');
const ip = require('ip');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var ipAddr = ip.address();

var socketOptions = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us2',
  encrypted: true
};

var socket = new Socket(socketOptions);

app.post('/pusher/auth', function(req, res) {
  console.log('> Presence auth: ', req.params, req.body);
  var socket_id = req.body.socket_id;
  var channel_name = req.body.channel_name;
  var data = { user_id: ipAddr };
  var auth = socket.authenticate(socket_id, channel_name, data);
  res.send(auth);
});

app.listen(3000, function() {
  console.log('> Server listening on port 3000...', ipAddr);

  console.log('> Initializing Pusher...');

  var client = new Client(process.env.PUSHER_APP_KEY, {
    cluster: 'us2',
    authEndpoint: 'http://localhost:3000/pusher/auth',
    encrypted: true
  });

  console.log('> Subscribing to changes...');
  var channel = client.subscribe('presence-node-coin');

  channel.bind("pusher:subscription_succeeded", function (members) {
    console.log('> Members: ', members);
  });

  channel.bind("pusher:member_added", function(member){
    console.log('> Member added: ', member);
  });

  channel.bind("pusher:member_removed", function(member){
    console.log('> Member removed: ', member);
  });

})
