import BlockClass from 'classes/Block';
import BlockModel from 'models/Block';
import store from 'store/store';

async function syncBlocksWithStore() {
  let numBlocks = await BlockModel.count();
  let lastBlock = await BlockModel.findOne().sort({ timestamp: -1 }).limit(1);

  if (numBlocks <= 0) {
    let block = new BlockClass(null, true);
    let newBlock = new BlockModel({
      version: block.header.version,
      previousHash: block.header.previousHash,
      merkleHash: block.header.merkleHash,
      timestamp: block.header.timestamp,
      difficulty: block.header.difficulty,
      nonce: block.header.nonce,
      txs: block.txs,
      blocksize: block.blocksize,
    });
    await newBlock.save();
    lastBlock = newBlock;
  }

  const { difficulty, nonce } = lastBlock;
  // update Redux store
  store.dispatch({ type: 'SET_NONCE', difficulty, nonce });
  store.dispatch({ type: 'SET_INITIAL_BLOCK_COUNT', lastBlock: formatBlock(lastBlock), numBlocks });
  return { numBlocks, lastBlock };
}

function formatBlock(block) {
  let newBlock = new BlockClass(block.previousHash, false, block.timestamp);
  newBlock.setHeader(block);
  return newBlock;
}

export default syncBlocksWithStore;
