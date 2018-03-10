import 'colors';

import BlockModel from 'models/Block';
import { formatBlock } from 'db/syncBlocksWithStore';
import net from 'net';
import store from 'store/store';
import { wait } from 'utils';

const DEFAULT_PORT = 8334;
const DELIMITER = '~~~~~'

let reg = new RegExp(DELIMITER, 'gi');

// First establish TCP/IP connection with peer
// If cannot establish connection or version is incompatible, set "peer.unreachable" to true
// exchange VERSION headers
// exchange blocks if missing blocks
// once receive blocks, start again with VERSION header until fully synced

async function connectWithPeer(peer, lastBlockHash, version) {
  let IS_VERSION_COMPATIBLE = false;
  let HAS_MORE_BLOCKS = false;
  // console.log('> Connecting with peer: ', peer, lastBlockHash, version);
  const port = DEFAULT_PORT;
  const client = new net.Socket();
  // PEER CONNECTED
  client.connect(port, peer.ip, () => {
    console.log('> Connected to peer: ', peer);
    let type = 'VERSION';
    client.write([ type, version, lastBlockHash ].join(DELIMITER));
    store.dispatch({ type: 'CONNECT_PEER', ip: peer.ip, client });
  });

  client.on('data', async data => {
    let [ type, ...args ] = data.toString().split(DELIMITER);
    console.log('> Received: '.yellow, data.toString().replace(reg, ' '));
    let version, blockHeaderHash, lastBlock, savedLastBlock, savedLastBlockHash;
    let blocksToSend, message, allPeers, unfetchedHeaders;
    let headers, peerIdx, header, block, savedBlock, newBlock;
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
        lastBlock = await BlockModel.findOne({ hash: blockHeaderHash });
        if (!lastBlock) {
          // send getblocks message
          savedLastBlock = store.getState().lastBlock;
          savedLastBlockHash = savedLastBlock.getBlockHeaderHash();
          client.write([ 'GETBLOCKS', savedLastBlockHash ].join(DELIMITER));
          break;
        }
        store.dispatch({ type: 'SYNC_PEER', ip: peer.ip });
        return true;
        break;

      // Peer requests block headers for up to 50 blocks
      case 'GETBLOCKS':
        blockHeaderHash = args[0];
        lastBlock = await BlockModel.findOne({ hash: blockHeaderHash });
        if (!!lastBlock) {
          blocksToSend = await BlockModel.find({ timestamp: { $gte: lastBlock.timestamp } }).limit(50);
          message = ['BLOCKHEADERS', ...blocksToSend.map(blk => blk.hash) ].join(DELIMITER);
          client.write(message);
        }
        break;

      // Receive block headers from peer
      case 'BLOCKHEADERS':
        // add to unfetchedHeaders
        store.dispatch({ type: 'ADD_UNFETCHED_HEADERS', headers: args });
        let { allPeers, unfetchedHeaders } = store.getState();
        headers = Array.from(unfetchedHeaders);
        peerIdx = 0;
        while (headers.length) {
          // assign header to peer
          let peer = allPeers[peerIdx];
          // connect with peer if no connection
          if (!peer.client) {
            // await connectWithPeer(peer, lastBlockHash, version);
          }
          header = headers.shift(); // dequeue a header
          client.write(`REQUESTBLOCK${DELIMITER}` + header);
          await wait(1); // wait 1 second
          // if peer doesn't respond within a period or doesn't have the block, move to next peer
          // if peer gives block, verify the block (if possible) and add to MongoDB

          // move from unfetched => loading
          store.dispatch({ type: 'LOADING_BLOCK', header });
          peerIdx = allPeers.length % (peerIdx + 1);
        }
        break;
      // Peer requests a specific block - find from DB and send serialized block
      case 'REQUESTBLOCK':
        // find the requested block and send as a JSON-serialized string
        header = args[0];
        block = await BlockModel.findOne({ hash: header });
        if (block) {
          let msg = JSON.stringify(block);
          client.write(`SENDBLOCK${DELIMITER}` + JSON.stringify(block));
        }
        break;

      case 'SENDBLOCK':
        block = JSON.parse(args[0]);
        // check if already have
        savedBlock = await BlockModel.findOne({ hash: block.hash });
        if (savedBlock) {
          break;
        }
        // if don't have, does the previousHash match our lastBlock.hash?
        lastBlock = store.getState().lastBlock;
        if (!lastBlock) {
          break;
        }
        if (block.previousHash === lastBlock.getBlockHeaderHash()) {
          // add block to blockchain
          newBlock = new BlockModel(block);
          await newBlock.save();
          // remove from orphan and unfetched / loading pools
          store.dispatch({ type: 'NEW_BLOCK', block: formatBlock(newBlock) });
        } else {
          // if not, add to orphan transactions
        }
    }
  });

  client.on('close', () => {
    console.log('> Connection closed');
  });
  client.on('timeout', () => {
    console.log('> Connection timed out ');
  });
  client.on('error', (err) => {
    console.error(err);
  });
}

export default connectWithPeer;
