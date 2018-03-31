import 'colors';

import BlockClass from 'classes/Block';
import BlockModel from 'models/Block';
import { EventEmitter } from 'events';
import SHA256 from 'js-sha256';
import axios from 'axios';
import { isNodeSynced } from '../connectWithPeer';
import { isValidTransaction } from 'db/syncBlocksWithStore';
import store from 'store/store';
import uuid from 'uuid';

const request = axios.create({
  validateStatus: (status) => true,
  responseType: 'json',
  timeout: 10000,
});

const MIN_TX_PER_BLOCK = 1;

export async function startMining() {
  console.log('> Starting mining new block: ');
  // check that all peers are synced
  const isSynced = await isNodeSynced();

  if (!isSynced) {
    // set "isMining" => false
    store.dispatch({ type: 'STOP_MINING' });
    return false;
  }
  // collect transactions from memory pool
  let txs = store.getState().memoryPool;

  let numTxs = txs.length;

  // ensure that transaction size > MIN_TX_PER_BLOCK
  if (numTxs < 0 || numTxs < MIN_TX_PER_BLOCK) {
    console.log('> Waiting for txs to mine... checking in 20 seconds');

    setTimeout(startMining, 20 * 1000); // check back in 10 seconds
    return false;
  }

  // verify all transactions in order - if any are invalid, remove from block
  console.log('> Validating txs for block....'.yellow);
  let finalizedTxs = [ ];
  for (let i = 0; i < numTxs; i++) {
    let tx = txs[i];
    // if (isValidTransaction(tx)) {

    if (true) {
      finalizedTxs.push(tx);
      // add to pendingBlockTxs
    } else {
      // remove from txs
    }
  }
  // get last block
  let lastBlock = await BlockModel.findOne({ }).sort({ timestamp: -1 }).limit(1);
  // set block header and implement nonce
  let header = {
    version: 1,
    previousHash: lastBlock.hash,
    merkleHash: uuid(),
    timestamp: new Date().getTime(),
    difficulty: lastBlock.difficulty,
    nonce: 0
  };

  let blockHeaderHash = SHA256(header.version + header.previousHash + header.merkleHash + header.timestamp + header.difficulty + header.nonce);
  let target = Math.pow(2, 256 - header.difficulty);
  console.log('> Calculating nonce....'.yellow);
  while (parseInt(blockHeaderHash, 16) > target) {
    // check that lastBlock has not changed
    let currentLastBlockHash = store.getState().lastBlock.getBlockHeaderHash();
    if (currentLastBlockHash !== lastBlock.hash) {
      await startMining();
      return false;
    }
    header.nonce++;
    blockHeaderHash = SHA256(header.version + header.previousHash + header.merkleHash + header.timestamp + header.difficulty + header.nonce);
  }

  let finalBlock = new BlockClass(header, finalizedTxs);
  console.log('> Finalized block: ', finalBlock);
  // set "isMining" => false
  store.dispatch({ type: 'STOP_MINING' });
  // submit new block with nonce and txs
  let url = 'https://pusher-presence-auth.herokuapp.com/blocks/new';
  let body = { block: finalBlock.getDBFormat() };
  let response = await request.post(url, body);
  console.log('> Send block response: '.yellow, response.data);
  return true;
}

export const emitter = new EventEmitter();

emitter.on('event:new_block', data => {

});

emitter.on('event:node_synced', data => {

});
