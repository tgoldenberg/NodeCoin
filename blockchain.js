const CryptoJS = require('crypto-js');
const flatfile = require('flat-file-db');

const db = flatfile.sync('/tmp/node-coin.db');
// const lastBlock = db.get('last_block');
// const firstBlock = db.get('first_block')
// const wholeChain = db.get('whole_chain');
/*
  keep a pointer to the "head", or Genesis block at all times. This will help re-create if need be
  also keep a point to the tail. we add on new transactions to the tail at all time.
  addresses = a hash map that maps a public address to a balance. users have to request an address, and are only allowed if the address does not exist.
*/

function calculateHash(index, previousHash, timestamp, data) {
  const { fromAddr, toAddr, amount, type } = data;
  return CryptoJS.SHA256(index + previousHash + timestamp + fromAddr + toAddr + amount + type).toString();
}

class Block {
  constructor(index, previousHash, timestamp, data, hash) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash.toString();
  }
}

const index = 0; // first block
const previousHash = ''; // no previous hash
const timestamp = new Date(2018, 0, 15);
const data = {
  fromAddr: 'from_addr',
  toAddr: 'to_addr',
  amount: 0,
  type: 'payment',
};
const hash = calculateHash(index, previousHash, timestamp, data)
const genesisBlock = new Block(index, previousHash, timestamp, data, hash);

class Blockchain {
  constructor(wholeChain) {
    if (wholeChain && typeof wholeChain.transactions === 'object' && typeof wholeChain.addresses === 'object') {
      this.transactions = wholeChain.transactions;
      this.addresses = wholeChain.addresses;
    } else {
      this.transactions = [ genesisBlock ];
      this.addresses = { };
    }
    this.me = null;
  }
  addTransaction(block) {
    if (block.previousHash === this.transactions[this.transactions.length - 1 ].hash) {
      this.transactions.push(block);
      db.put('transactions', this.transactions);
    }
  }
  registerAddress(address) {
    if (this.addresses[address] !== undefined) {
      throw new Error('Address already taken.');
    }
    this.addresses[address] = 0;
    const data = {
      fromAddr: address,
      toAddr: address,
      amount: 0,
      type: 'register_address',
    };
    const hash = calculateHash(index, previousHash, timestamp, data);
    const tail = this.transactions[this.transactions.length - 1];
    let block = new Block(tail.index + 1, tail.hash, new Date().valueOf(), data, hash);
    return block;
  }
  saveBlockchain() {
    let chain = {
      transactions: this.transactions,
      addresses: this.addresses,
    };
    db.put('whole_chain', chain);
  }
}

module.exports = Blockchain;
