const store = require('store/store');

import SHA256 from 'js-sha256';

const COIN = 100000000;
const genesisPreviousHash = '0000000000000000000000000000000000000000000000000000000000000000';
const genesisMerkleRoot = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';
const genesisDifficulty = 486604799;
const genesisNonce = 2083236893;
const genesisTimestamp = 1231006505000; // Jan 3, 2009
const genesisTransaction = {
  vin: [ { n: 'COINBASE', prevout: null } ],
  vout: [ { nValue: 50 * COIN, scriptPubKey: '04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f' } ]
};

class Block {
  constructor(previousHash, isGenesis = false, timestamp = Date.now()) {
    let state = store.getState();
    this.header = {
      version: state.version,
      previousHash: isGenesis ? genesisPreviousHash : previousHash,
      merkleHash: isGenesis ? genesisMerkleRoot : null,
      timestamp: isGenesis ? genesisTimestamp : timestamp,
      difficulty: isGenesis ? genesisDifficulty : state.difficulty,
      nonce: isGenesis ? genesisNonce : state.nonce,
    };
    this.txs = [ ];
    if (isGenesis) {
      this.addTransaction(genesisTransaction);
    }
    this.blocksize = JSON.stringify(this).length;
  }
  getBlockHeaderHash() {
    const { version, previousHash, merkleHash, timestamp, difficulty, nonce } = this.header;
    return SHA256([ version, previousHash, merkleHash, timestamp, difficulty, nonce ].join(' '));
  }
  setHeader(header) {
    this.header = {
      version: header.version,
      previousHash: header.previousHash,
      merkleHash: header.merkleHash,
      timestamp: header.timestamp,
      difficulty: header.difficulty,
      nonce: header.nonce,
    };
    return this.header;
  }
  addTransaction(transaction) {
    this.txs.push(transaction);
    return this.txs;
  }
};

// let block = new Block(null, true); // genesis block
// console.log('> Genesis block: ', block);

module.exports = Block;
