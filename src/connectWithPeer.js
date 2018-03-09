import 'colors';

import BlockModel from 'models/Block';
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

    // connect client to peer in Redux store
    store.dispatch({ type: 'CONNECT_PEER', ip: peer.ip, client });
  });

  client.on('data', async data => {
    let [ type, ...args ] = data.toString().split(' ');
    console.log('> Received: '.yellow, data.toString());
    let version, blockHeaderHash;
    switch(type) {
      // Initial swapping of version number of last block hash
      case 'VERSION':
        version = args[0];
        blockHeaderHash = args[1];
        if (version !== '1') {
          break;
        }
        IS_VERSION_COMPATIBLE = true;
        // check db for what block height received block hash is
        let lastBlock = await BlockModel.findOne({ hash: blockHeaderHash });
        if (!lastBlock) {
          // send getblocks message
          let savedLastBlock = store.getState().lastBlock;
          let savedLastBlockHash = savedLastBlock.getBlockHeaderHash();
          client.write([ 'GETBLOCKS', savedLastBlockHash ].join(' '));
          break;
        }
        console.log('> Synced with peer'.blue);
        break;

      // Peer requests block headers for up to 50 blocks
      case 'GETBLOCKS':
        blockHeaderHash = args[0];
        lastBlock = await BlockModel.findOne({ hash: blockHeaderHash });
        if (!!lastBlock) {
          let blocksToSend = await BlockModel.find({ timestamp: { $gte: lastBlock.timestamp } }).limit(50);
          let message = 'BLOCKHEADERS ' + blocksToSend.map(blk => blk.hash).join(' ');
          client.write(message);
        }
        break;

      // Receive block headers from peer
      case 'BLOCKHEADERS':
        let blockHeaders = args;
        console.log('> New block headers: ', blockHeaders);
        // iterate through peers and ask for specific block
    }
  });

  client.on('close', () => {
    console.log('> Connection closed');
  })
}

export default connectWithPeer;
