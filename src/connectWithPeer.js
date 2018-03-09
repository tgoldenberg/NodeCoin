import 'colors';

import BlockModel from 'models/Block';
import net from 'net';
import store from 'store/store';
import { wait } from 'utils';

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
      // add to unfetchedHeaders
      store.dispatch({ type: 'ADD_UNFETCHED_HEADERS', headers: args });
      let { allPeers, unfetchedHeaders } = store.getState();
      let headers = Array.from(unfetchedHeaders);
      let peerIdx = 0;
      while (headers.length) {
        // assign header to peer
        let peer = allPeers[peerIdx];
        // connect with peer if no connection
        if (!peer.client) {
          // await connectWithPeer(peer, lastBlockHash, version);
        }
        let header = headers.shift(); // dequeue a header
        client.write('REQUESTBLOCK ' + header);
        await wait(1); // wait 1 second
        // if peer doesn't respond within a period or doesn't have the block, move to next peer
        // if peer gives block, verify the block (if possible) and add to MongoDB

        // move from unfetched => loading
        store.dispatch({ type: 'LOADING_BLOCK', header });
        peerIdx = allPeers.length % (peerIdx + 1);
      }
      break;
    }
  });

  client.on('close', () => {
    console.log('> Connection closed');
  })
}

export default connectWithPeer;
