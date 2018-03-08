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
  vout: [ { nValue: 50 * COIN, scriptPubKey: '1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M' } ]
};

class Block {
  constructor(header, txs, isGenesis = false) {
    let state = store.getState();
    this.header = {
      version: isGenesis ? 1 : header.version,
      previousHash: isGenesis ? genesisPreviousHash : header.previousHash,
      merkleHash: isGenesis ? genesisMerkleRoot : header.merkleHash,
      timestamp: isGenesis ? genesisTimestamp : header.timestamp,
      difficulty: isGenesis ? genesisDifficulty : header.difficulty,
      nonce: isGenesis ? genesisNonce : header.nonce,
    };
    this.txs = [ ];
    if (isGenesis) {
      this.addTransaction(genesisTransaction);
    } else {
      this.txs = txs;
    }
    this.blocksize = JSON.stringify(this).length;
  }
  getBlockHeaderHash() {
    const { version, previousHash, merkleHash, timestamp, difficulty, nonce } = this.header;
    return SHA256([ version, previousHash, merkleHash, timestamp, difficulty, nonce, JSON.stringify(this.txs) ].join(' '));
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
