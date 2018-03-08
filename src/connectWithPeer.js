import net from 'net';

async function connectWithPeer(peer, lastBlockHash, version) {
  console.log('> Connecting with peer: ', peer, lastBlockHash, version);
  const port = peer.port || 8334;
  const client = new net.Socket();
  client.connect(port, peer.ip, () => {
    console.log('> Connected to peer: ', peer);
    const type = 'VERSION';
    client.write([ type, version, lastBlockHash ].join(' '));
  });

  client.on('data', data => {
    console.log('> Received: ', data.toString());
  });

  client.on('close', () => {
    console.log('> Connection closed');
  })
}

export default connectWithPeer;
