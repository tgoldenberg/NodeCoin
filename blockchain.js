/*
  keep a pointer to the "head", or Genesis block at all times. This will help re-create if need be
  also keep a point to the tail. we add on new transactions to the tail at all time.
  addresses = a hash map that maps a public address to a balance. users have to request an address, and are only allowed if the address does not exist.
*/
class Blockchain {
  constructor() {
    this.head = null;
    this.tail = null;
    this.addresses = { };
  }
  addTransaction() {

  }
  addAddress(address) {
    if (this.addresses[address] !== undefined) {
      throw new Error('Address already taken.');
    }
    this.addresses[address] = 0;
  }
}

module.exports = Blockchain;
