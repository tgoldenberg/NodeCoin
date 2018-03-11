import RIPEMD160 from 'ripemd160';
import SHA256 from 'js-sha256';
import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

// hash message - this method hashes the transaction header (# bytes, publicAddress, amount of money)
function Hash(msg) {
  let result = SHA256(msg);
  return new RIPEMD160().update(msg).digest('hex');
}

export function lockTransaction(message, publicKey) {
  const publicKeyScript = [ encodeURIComponent(message), publicKey ].join(' ');
  return publicKeyScript;
}

export function unlockTransaction(message, publicAddress, privateKey) {
  try {
    const messageHash = Hash(decodeURIComponent(message));
    const privateKeyPair = ec.keyFromPrivate(privateKey);
    const signature = ec.sign(messageHash, privateKeyPair);
    return signature.toDER('hex');
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export function verifyUnlock(message, publicAddress, signature) {
  try {
    const messageHash = Hash(decodeURIComponent(message));
    const publicKeyPair = ec.keyFromPublic(publicAddress, 'hex');
    const isVerified = publicKeyPair.verify(messageHash, signature);
    return isVerified;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

let privateKey = '0fcb37c77f68a69b76cd5b160ac9c85877b4e8a09d8bcde2c778715c27f9a347';
let message = '5b28c8abc6dd6ecdb7e7704d348ab9f0485e5a115997fada69f9b4883964c82f';
let publicKey = '044283eb5f9aa7421f646f266fbf5f7a72b7229a7b90a088d1fe45292844557b1d80ed9ac96d5b3ff8286e7794e05c28f70ae671c7fecd634dd278eb0373e6a3ba';
let scriptSig = '3046022100a035ca83d2feaf8ac1747304b5a4bf0201ddb1482bf9e4f2a1908c432c951ed8022100a9d4abe7d462cbf0b6803ca7cad5ed653ef944c7a4b331d70883f13d9bc8995a';

// console.log('> Signing tx: ', unlockTransaction(message, publicKey, privateKey));
// console.log('> Verifying unlock: ', verifyUnlock(message, publicKey, scriptSig));

export function testVerification(publicKeyScript, privateKey) {
  const [ message, publicKey ] = publicKeyScript.split(' ');
  const signature = unlockTransaction(message, publicKey, privateKey);
  // console.log('> Signature: ', signature);
  const isVerified = verifyUnlock(message, publicKey, signature);
  // console.log('> Is verified: ', isVerified);
  return isVerified;
}

/////////////////////////////////////////////////////////////////
//
// TESTING
//
/////////////////////////////////////////////////////////////////

// let message = 'I want to send this money';
// let publicKeyHash = 'bc6852feffa506e9bd20ab874f591488c94452b0';
// let publicKey = '040b6e5e8aefa89e4d70e7f74c70dfffe10d9bae4a846213e15e485c1f8d1e1635c62f3e341498f00de895b687cae2a2e43a4808f4c75dd68122e159de7f4a0d96';
// let publicAddress = '1JBD1dwNUAwVHXSPkpA3o27F6Qcv1yoc3u';
// let privateKeyWif = '5JzAwuNcBrh9nd5xaLbvjWdaMriFyysRs711JtbH2RJtbwwTrTh';
// let privateKey = '9a2481a0101b7d75062eea7d5e7689c3d8ec87209ae4c5f76dd5c0235a806fda';
// let input = { message, publicKey }; // we want to verify that this transaction belongs to us

// let publicKeyScript = lockTransaction(input.message, input.publicKey);
// testVerification(publicKeyScript, privateKey);

// publicKeyScript = lockTransaction(input.message, '04487bd002b2b61a1bbc89b3c05cebf73039d4722c96877308ee4905c10f155d71f03dca22650a2aea193416dd5071260b3fca82ab5a254163371e5929fb28c0f2');
// testVerification(publicKeyScript, privateKey); // different address
