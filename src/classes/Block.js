const store = require('store/store');

import SHA256 from 'js-sha256';
import { lockTransaction } from 'utils/validateSignature';
import { myWallet } from '__mocks__/blocks';
import uuid from 'uuid';

const MY_PUBLIC_KEY = '044283eb5f9aa7421f646f266fbf5f7a72b7229a7b90a088d1fe45292844557b1d80ed9ac96d5b3ff8286e7794e05c28f70ae671c7fecd634dd278eb0373e6a3ba';
const COIN = 100000000;
const genesisPreviousHash = '0000000000000000000000000000000000000000000000000000000000000000';
const genesisMerkleRoot = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';
const genesisDifficulty = 486604799;
const genesisNonce = 2083236893;
const genesisTimestamp = 1231006505000; // Jan 3, 2009

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
      const txid = SHA256(this.getBlockHeaderHash() + '0');
      const genesisTransaction = {
        vin: [ { n: 'COINBASE', prevout: null } ],
        vout: [ { nValue: 50 * COIN, scriptPubKey: lockTransaction(txid, MY_PUBLIC_KEY) } ]
      };
      this.addTransaction(genesisTransaction);
    } else {
      this.txs = txs;
    }
    this.blocksize = JSON.stringify(this).length;
  }
  getDBFormat() {
    return {
      hash: this.getBlockHeaderHash(),
      version: this.header.version,
      previousHash: this.header.previousHash,
      merkleHash: this.header.merkleHash,
      timestamp: this.header.timestamp,
      difficulty: this.header.difficulty,
      nonce: this.header.nonce,
      txs: this.txs,
      blocksize: this.blocksize,
    };
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
    let idx = this.txs.length;
    this.txs.push({ ...transaction, hash: SHA256(this.getBlockHeaderHash() + idx) });
    return this.txs;
  }
};

// let block = new Block(null, true); // genesis block
// console.log('> Genesis block: ', block);

module.exports = Block;
