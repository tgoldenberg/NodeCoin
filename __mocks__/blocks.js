import { lockTransaction, unlockTransaction } from 'utils/validateSignature';

import BlockClass from 'classes/Block';
import BlockModel from 'models/Block';
import SHA256 from 'js-sha256';
import { formatBlock } from 'db/syncBlocksWithStore';
import uuid from 'uuid';

const COIN = 100000000;
const COINBASE_REWARD = 50 * COIN;
const COINBASE_MSG = SHA256('00000000')

export const myWallet = {
  privateKey: '0fcb37c77f68a69b76cd5b160ac9c85877b4e8a09d8bcde2c778715c27f9a347',
  publicKey:'044283eb5f9aa7421f646f266fbf5f7a72b7229a7b90a088d1fe45292844557b1d80ed9ac96d5b3ff8286e7794e05c28f70ae671c7fecd634dd278eb0373e6a3ba',
  publicKeyHash:'ed2f84f67943321bf73747936db3e7273ada7f6c',
  address:'1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M',
  privateKeyWIF:'5HwF1jU38V8YhpBy9PuNC4hTYkKrDccLE28qV7tLxZ7u3pKXCy4',
};

const friendWallet = {
  privateKey: '6128428978e30fc034c95b7b091b373b875bdd73a0acf83c09d37bff72361349',
  publicKey: '04804a9ed2855fcea0f5b6e23e587a6c6f7159f15c84b9c82474231cfdac04827fac72a36bd0b463fc61c4d66a954aa7d5f95bde970804f81c8d6f712390516fbb',
  publicKeyHash: 'f3a7ee518818e7adc56ed12e9f483712fc4dd0d5',
  address: '1PDLNfJq5GAEn5StESZuBpaBe6B3134vmD',
  privateKeyWIF: '5JZ5LHz7Kr3FXeU7asLfffasonpmxUX3smTQb8LtsD21UQqiYqo',
};


export async function seedBlocks() {
  // BLOCK 1
  await BlockModel.find({ }).remove({ });
  let genesisBlock = new BlockClass({ }, [ ], true); // gives "myWallet" 50 COIN
  let savedGenesisBlock = new BlockModel(genesisBlock.getDBFormat());
  console.log('> New block 1: '.blue, savedGenesisBlock.hash);
  await savedGenesisBlock.save();

  let remaining = 50 * COIN;

  // BLOCK 2
  let prev = genesisBlock;
  let amount = Math.floor(Math.random() * 16);
  let header = { version: 1, previousHash: prev.getBlockHeaderHash(), merkleHash: uuid(), timestamp: new Date().getTime(), difficulty: prev.header.difficulty, nonce: 0 };
  let blockHeaderHash = SHA256(header.version + header.previousHash + header.merkleHash + header.timestamp + header.difficulty + header.nonce);
  let target = Math.pow(2, 256 - header.difficulty);
  while (parseInt(blockHeaderHash, 16) > target) {
    header.nonce++;
    blockHeaderHash = SHA256(header.version + header.previousHash + header.merkleHash + header.timestamp + header.difficulty + header.nonce);
  }
  let block = new BlockClass(header, [ ]);
  // let txId = SHA256(block.getBlockHeaderHash() + '0');
  remaining -= (amount * COIN);
  let transactions = [
    {
      vin: [ { n: 'COINBASE', prevout: null } ],
      vout: [ { nValue: COINBASE_REWARD, scriptPubKey: lockTransaction(COINBASE_MSG, myWallet.publicKey) } ]
    },
    {
      vin: [ { n: 0, prevout: prev.txs[0].hash, scriptSig: unlockTransaction(COINBASE_MSG, myWallet.publicKey, myWallet.privateKey) } ],
      vout: [
        { nValue: amount * COIN, scriptPubKey: lockTransaction(COINBASE_MSG, friendWallet.pulicKey) } ,
        { nValue: remaining, scriptPubKey: lockTransaction(COINBASE_MSG, myWallet.publicKey) }
      ]
    },
  ]
  transactions.forEach(tx => block.addTransaction(tx));
  let newBlock = new BlockModel(block.getDBFormat());
  console.log('> New block 2: '.blue, newBlock.hash);
  await newBlock.save();

  // BLOCK 3
  prev = formatBlock(newBlock);
  amount = Math.floor(Math.random() * 16);
  header = { version: 1, previousHash: prev.getBlockHeaderHash(), merkleHash: uuid(), timestamp: new Date().getTime(), difficulty: prev.header.difficulty, nonce: prev.header.nonce };
  blockHeaderHash = SHA256(header.version + header.previousHash + header.merkleHash + header.timestamp + header.difficulty + header.nonce);
  target = Math.pow(2, 256 - header.difficulty);
  while (parseInt(blockHeaderHash, 16) > target) {
    header.nonce++;
    blockHeaderHash = SHA256(header.version + header.previousHash + header.merkleHash + header.timestamp + header.difficulty + header.nonce);
  }
  block = new BlockClass(header, [ ]);
  let txId = COINBASE_MSG;
  remaining -= (amount * COIN);
  transactions = [
    {
      vin: [ { n: 'COINBASE', prevout: null } ],
      vout: [ { nValue: COINBASE_REWARD, scriptPubKey: lockTransaction(COINBASE_MSG, myWallet.publicKey) } ]
    },
    {
      vin: [
        { n: 1, prevout: prev.txs[1].hash, scriptSig: unlockTransaction(COINBASE_MSG, myWallet.publicKey, myWallet.privateKey) }
      ],
      vout: [
        { nValue: amount * COIN, scriptPubKey: lockTransaction(COINBASE_MSG, friendWallet.pulicKey) } ,
        { nValue: remaining, scriptPubKey: lockTransaction(COINBASE_MSG, myWallet.publicKey) }
      ]
    },
  ];
  transactions.forEach(tx => block.addTransaction(tx));
  let newBlock2 = new BlockModel(block.getDBFormat());
  console.log('> New block 3: '.blue, newBlock2.hash);
  await newBlock2.save();

  return savedGenesisBlock;
}

// seedBlocks();
