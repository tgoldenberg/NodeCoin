import Block from 'models/Block';
import net from 'net';
import store from 'store/store';

const DEFAULT_PORT = 8334;

async function connectWithPeer(peer, lastBlockHash, version) {
  let IS_CONNECTED = false;
  let IS_VERSION_COMPATIBLE = false;
  let HAS_MORE_BLOCKS = false;
  // console.log('> Connecting with peer: ', peer, lastBlockHash, version);
  const port = DEFAULT_PORT;
  const client = new net.Socket();
  client.connect(port, peer.ip, () => {
    console.log('> Connected to peer: ', peer);
    IS_CONNECTED = true;
    let type = 'VERSION';
    client.write([ type, version, lastBlockHash ].join(' '));
  });

  client.on('data', async data => {
    let [ type, ...args ] = data.toString().split(' ');
    // console.log('> Received: ', data.toString());
    let version, blockHeaderHash;
    switch(type) {
      case 'VERSION':
        version = args[0];
        blockHeaderHash = args[1];
        if (version !== '1') {
          break;
        }
        IS_VERSION_COMPATIBLE = true;
        console.log('> Received block hash: ', blockHeaderHash);
        // check db for what block height received block hash is
        let lastBlock = await Block.findOne({ hash: blockHeaderHash });
        if (!lastBlock) {
          // send getblocks message
          let savedLastBlock = store.getState().lastBlock;
          let savedLastBlockHash = savedLastBlock.getBlockHeaderHash();
          client.write([ 'GETBLOCKS', savedLastBlockHash ].join(' '));
        }
        break;
      case 'GETBLOCKS':
        // find next 50 blocks
    }
  });

  client.on('close', () => {
    console.log('> Connection closed');
  })
}

export default connectWithPeer;
