const CryptoJS = require('crypto-js');
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
  constructor() {
    this.head = genesisBlock;
    this.tail = genesisBlock;
    this.addresses = { };
  }
  addTransaction(block) {
    if (block.previousHash === this.tail.hash) {
      this.tail = block;
    }
  }
  addAddress(address) {
    if (this.addresses[address] !== undefined) {
      throw new Error('Address already taken.');
    }
    this.addresses[address] = 0;
  }
}

module.exports = Blockchain;
