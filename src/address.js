const EC = require('elliptic').ec;
const secureRandom = require('secure-random');
const coinstring = require('coinstring');
const RIPEMD160 = require('ripemd160');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

const ec = new EC('secp256k1');

const DEFAULT_VERSIONS = { public: 0x0, private: 0x80 };

export function Hash(msg) {
  let result = crypto.createHash('sha256').update(msg).digest();
  return new RIPEMD160().update(result).digest();
}

export function getAddress(publicKey) {
  let publicKeyHash = Hash(publicKey);
  return coinstring.encode(publicKeyHash, DEFAULT_VERSIONS.public);
}

export function makeWallet() {
  let privateKey, privateKeyHex, publicKey, publicKeyHex, publicKeyHash, key, privateKeyWIF, publicAddress;
  privateKey = secureRandom.randomBuffer(32); // start with random 32 bit hex string
  console.log('> Private key created: ', privateKey.toString('hex'))

  // generate public key from private
  var keys = ec.keyFromPrivate(privateKey);
  publicKey = keys.getPublic('hex');
  console.log('> Public key created: ', publicKey);

  // generate public key hash
  publicKeyHash = Hash(publicKey);
  console.log('> Public key hash created: ', publicKeyHash.toString('hex'));

  // generate public address
  publicAddress = coinstring.encode(publicKeyHash, DEFAULT_VERSIONS.public);
  console.log('> Public address created: ', publicAddress);

  // generate private key WIF (wallet import format)
  privateKeyWIF = coinstring.encode(privateKey, DEFAULT_VERSIONS.private);
  console.log('> Private key WIF (wallet import format) created : ', privateKeyWIF);

  key = {
    privateKey,
    publicKey,
    publicKeyHash,
    privateKeyWIF,
    publicAddress
  };
  return key;
}

// makeWallet();
// module.exports = makeWallet;
