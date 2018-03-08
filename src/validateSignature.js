const RIPEMD160 = require('ripemd160');
const EC = require('elliptic').ec;
const sha256 = require('js-sha256');

const ec = new EC('secp256k1');

let message = 'I want to send this money';
let publicKeyHash = 'bc6852feffa506e9bd20ab874f591488c94452b0';
let publicKey = '040b6e5e8aefa89e4d70e7f74c70dfffe10d9bae4a846213e15e485c1f8d1e1635c62f3e341498f00de895b687cae2a2e43a4808f4c75dd68122e159de7f4a0d96';
let publicAddress = '1JBD1dwNUAwVHXSPkpA3o27F6Qcv1yoc3u';
let privateKeyWif = '5JzAwuNcBrh9nd5xaLbvjWdaMriFyysRs711JtbH2RJtbwwTrTh';
let privateKey = '9a2481a0101b7d75062eea7d5e7689c3d8ec87209ae4c5f76dd5c0235a806fda';

let input = { message, publicKey }; // we want to verify that this transaction belongs to us

// hash message - this method hashes the transaction header (# bytes, publicAddress, amount of money)
function Hash(msg) {
  let result = sha256(msg);
  return new RIPEMD160().update(msg).digest('hex');
}

function lockTransaction(message, publicKey) {
  const publicKeyScript = [ encodeURIComponent(message), publicKey ].join(' ');
  return publicKeyScript;
}

function unlockTransaction(message, publicAddress, privateKey) {
  const messageHash = Hash(decodeURIComponent(message));
  const privateKeyPair = ec.keyFromPrivate(privateKey);
  const signature = ec.sign(messageHash, privateKeyPair);
  return signature;
}

function verifyUnlock(message, publicAddress, signature) {
  const messageHash = Hash(decodeURIComponent(message));
  const publicKeyPair = ec.keyFromPublic(publicAddress, 'hex');
  const isVerified = publicKeyPair.verify(messageHash, signature);
  return isVerified;
}

function testVerification(publicKeyScript, privateKey) {
  const [ message, publicKey ] = publicKeyScript.split(' ');
  const signature = unlockTransaction(message, publicKey, privateKey);
  console.log('> Signature: ', signature.toDER('hex'));
  const isVerified = verifyUnlock(message, publicKey, signature);
  console.log('> Is verified: ', isVerified);
}

let publicKeyScript = lockTransaction(input.message, input.publicKey);
testVerification(publicKeyScript, privateKey);

publicKeyScript = lockTransaction(input.message, '04487bd002b2b61a1bbc89b3c05cebf73039d4722c96877308ee4905c10f155d71f03dca22650a2aea193416dd5071260b3fca82ab5a254163371e5929fb28c0f2');
testVerification(publicKeyScript, privateKey); // different address
