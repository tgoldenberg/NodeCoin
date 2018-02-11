const Pusher = require('pusher-js');
const express = require('express');
const app = express();

require('dotenv').config();

app.listen(3000, function() {
  console.log('> Server listening on port 3000...');

  console.log('> Initializing Pusher...');
  var pusher = new Pusher(process.env.PUSHER_APP_KEY);

  console.log('> Subscribing to changes...');
  var channel = pusher.subscribe('presence-node-coin')

  channel.bind('tx', function(data) {
    console.log('> New transaction: ', data.message);
  });

  var count = channel.members.count;
  console.log('> Num connected nodes: ', count, channel.members.me, channel);
})
