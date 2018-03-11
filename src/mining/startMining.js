import { EventEmitter } from 'events';
import { isNodeSynced } from '../connectWithPeer';
import store from 'store/store';

export async function startMining() {
  console.log('> Starting mining new block: ');
  // check that all peers are synced
  const isSynced = await isNodeSynced();
  // collect transactions from memory pool

  // ensure that transaction size > MIN_TX_PER_BLOCK

  // verify all transactions in order - if any are invalid, remove from block

  // set block header and implement nonce

  // submit new block with nonce and txs
}

export const emitter = new EventEmitter();

emitter.on('event:new_block', data => {

});

emitter.on('event:node_synced', data => {

});
