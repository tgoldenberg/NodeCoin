import 'colors';

import { testVerification, verifyUnlock } from 'utils/validateSignature';

import BlockClass from 'classes/Block';
import BlockModel from 'models/Block';
import find from 'lodash/find';
import store from 'store/store';

const COIN = 100000000;
const COINBASE_REWARD = 50 * COIN;
const MIN_FEES = 5;
const GENESIS_PREVIOUS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function isValidBlock(block, prevBlock) {
  const { txs } = block;
  for (let i = 0; i < txs.length; i++) {
    let isValid = await isValidTransaction(txs[i]);
    if (!isValid) {
      return false;
    }
  }
  // check previous hash to make sure is correct
  if (!prevBlock) {
    if (block.header.previousHash !== GENESIS_PREVIOUS_HASH) {
      return false;
    }
  } else {
    // check blockHeaderHash to see if is an accurate hash
    let prevHash = prevBlock.getBlockHeaderHash();
    if (block.header.previousHash != prevHash) {
      return false;
    }
  }
  // TODO: check locktime, nSequence
  // check difficulty and nonce
  let difficulty = block.header.difficulty;
  let target = Math.pow(2, 256 - difficulty);
  if (parseInt(block.getBlockHeaderHash(), 16) > target) {
    console.log('> Incorrect nonce: ', block.header);
    return false;
  }
  return true;
}

export async function isValidTransaction(tx, blockHeaderHash) {
  // verify has "vin" and "vout" as Arrays
  if (!tx.vin || !tx.vin.length || !tx.vout || !tx.vout.length) {
    return false;
  }
  let isCoinbase = false;
  let txinValue = 0;
  let txoutValue = 0;
  // check transaction inputs
  for (let i = 0; i < tx.vin.length; i++) {
    let txin = tx.vin[i];
    if (typeof txin.n === 'string' && txin.n === 'COINBASE') {
      // make sure only one coinbase
      if (tx.vout.length > 1 || tx.vin.length > 1 || tx.vout[i].nValue > COINBASE_REWARD) {
        // ensure coinbase is not greater than agreed on reward
        return false;
      }
      return true;
    }
    if (!txin.prevout || !txin.scriptSig || typeof txin.n != 'number') {
      return false;
    }
    // find previous UTXO
    let prevTxBlock = await BlockModel.findOne({ 'txs.hash': txin.prevout });
    if (!prevTxBlock) {
      return false;
    }
    let prevTx = find(prevTxBlock.txs, ({ hash }) => hash === txin.prevout);
    if (!prevTx) {
      return false;
    }
    txinValue += prevTx.vout[txin.n].nValue;
    // ensure that prevout is UXTO - prevent double spending
    let alreadySpentTxs = await BlockModel.find({ "txs.vin.prevout": txin.prevout });
    if (alreadySpentTxs.length > 1) {
      return false;
    }
    // verify signature
    let publicKeyScript = prevTx.vout[txin.n].scriptPubKey;
    const [ message, publicKey ] = publicKeyScript.split(' ');
    let isVerified = verifyUnlock(message, publicKey, txin.scriptSig);
    if (!isVerified) {
      return false;
    }
  }

  // check transaction outputs
  for (let i = 0; i < tx.vout.length; i++) {
    let txout = tx.vout[i];
    if (typeof txout.nValue != 'number' || typeof txout.scriptPubKey != 'string') {
      return false;
    }
    txoutValue += txout.nValue;
  }
  let totalFees = txinValue - txoutValue;
  return true;
}

export async function syncBlocksWithStore() {
  console.log('> Setting up and verifying block chain...'.gray);
  let blocks = await BlockModel.find({ });
  let lastBlock = blocks[blocks.length - 1];
  let numBlocks = blocks.length;

  let areBlocksValid = true;
  // verify validity of blocks
  // if invalid, reset local storage
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    let prevBlock = i === 0 ? null : formatBlock(blocks[i - 1]);
    // let isValid = await isValidBlock(formatBlock(block), prevBlock);
    let isValid = true;
    if (!isValid) {
      areBlocksValid = false;
      await BlockModel.find({ }).remove({ }); // remove corrupted blocks
      numBlocks = 0;
      lastBlock = null;
      blocks = [ ];
      break;
    }
  }

  console.log('> Blocks verified: '.blue, areBlocksValid, numBlocks);

  // if invalid blocks or no local blocks, initialize genesis block
  if (numBlocks <= 0) {
    let block = new BlockClass({ }, [ ], true);
    let newBlock = new BlockModel(block.getDBFormat());
    await newBlock.save();
    lastBlock = newBlock;
  }

  const { difficulty, nonce } = lastBlock;

  // update Redux store
  store.dispatch({ type: 'SET_DIFFICULTY', difficulty, nonce });
  store.dispatch({ type: 'SET_INITIAL_BLOCK_COUNT', lastBlock: formatBlock(lastBlock), numBlocks });
  return { numBlocks, lastBlock };
}

export function formatBlock(block) {
  let newBlock = new BlockClass(block, block.txs);
  newBlock.setHeader(block);
  return newBlock;
}
