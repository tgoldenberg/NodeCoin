const bs58 = require('bs58');
const coinkey = require('coinkey');
const converter = require('convert-hex');
const crypto = require('crypto');
const ethereumWallet = require('ethereumjs-wallet');
const sha256 = require('sha256');

const WATCHER_KEY = 'guest_DQBVU@blockonomics.co';

/**
 * @description
 * https://github.com/ryanralph/altcoin-address/blob/master/index.js -> For list of prefixes for other Alt coins
 * Logs out private (WIF) and public (Compressed) keys of wallet to the console
 * @param
 * currency: String. name of crypto currency to generate wallet for e.g "ltc", "btc"...
 */
function getWallet(currency) {
  currency = currency.toUpperCase();

  let privateKeyArr;
  let privateKeyHex;
  let key;
  let privateKeyWif;
  let publicAddress;

  console.log('> Creating random Private key hex for wallet...');
  // Creates and fill empty byte array with random
  privateKeyArr = createRandomUint8(32);

  // Transform byte array to a regular JS array
  privateKeyArr = uInt8ToJsArray(privateKeyArr);

  // Transform byte array to a Hex
  privateKeyHex = byteToHexString(privateKeyArr);

  console.log('> Private key hex created')
  console.log('> Creating new private WIF and public key depending on encryption');

  switch (currency) {
    case 'BTC':
      key = new coinkey(new Buffer(privateKeyHex, 'hex'));
      privateKeyWif = key.privateWif;
      publicAddress = key.publicAddress;
      break;
    case 'ETH':
      key = ethereumWallet.fromPrivateKey(new Buffer(privateKeyHex, 'hex'));
      privateKeyWif = key.getPrivateKey().toString('hex');
      publicAddress = key.getAddressString();
      break;
    case 'LTC':
      key = new coinkey(new Buffer(privateKeyHex, 'hex'), { private: 0xB0, public: 0x30 });
      privateKeyWif = key.privateWif;
      publicAddress = key.publicAddress;
      break;
  }


  console.log(`~~~~~ ${currency} Private key: ${key.privateWif}`);
  console.log(`~~~~~ ${currency} Public key: ${key.publicAddress}`);
}


/**
  * @param
  * size: number -> Length of array to be returned
  * @returns
  * Array of Cryptographically secure random numbres
  */
function createRandomUint8(size = 32) {
  // let byteArr = new Uint8Array(32); // Creates an empty typed array of 32 bytes
  // crypto.randomFill(byteArr, (err, buf) => {
  //   if(err) {
  //     console.warn(`Error while random filling typed array\n ${err.message}`);
  //   }
  //   /* Success */
  // });
  // return byteArr;
  return crypto.randomBytes(size / 2).toString('hex').split('');

}

/**
  * @param
  * uint8Arr: Typed array to transform
  * @returns
  * Regular JS array
  */
function uInt8ToJsArray(uint8Arr) {
  let jsArray = [ ];
  for (let i = 0; i < uint8Arr.length; i ++) {
    jsArray[i] = uint8Arr[i];
  }
  return jsArray;
}

/**
  * @param
  * byteArr: byte array to transform
  * @returns
  * hex string
  */
function byteToHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

getWallet('BTC');

module.exports = getWallet;
