import { getAddress, makeWallet } from '../address';

import BlockModel from 'models/Block';
import find from 'lodash/find';
import { lockTransaction } from 'utils/validateSignature';

const COIN = 100000000;

export async function getWallets() {
  let wallets = { };
  // keep map of balances
  // for each txin, subtract from the address
  // for each txout, add to the address balance
  let blocks = await BlockModel.find({ }).sort({ timestamp: 1 });
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    for (let j = 0; j < block.txs.length; j++) {
      let tx = block.txs[j];
      for (let k = 0; k < tx.vin.length; k++) {
        let txin = tx.vin[k];
        if (txin.prevout != 'COINBASE') {
          // find amount from previout tx and subtract from address
          let prevTxBlock = await BlockModel.findOne({ "txs.hash": txin.prevout });
          if (prevTxBlock) {
            let prevTx = find(prevTxBlock.txs, ({ hash }) => hash === txin.prevout);
            let prevTxOut = prevTx.vout[txin.n];
            let address = getAddress(prevTxOut.scriptPubKey.split(' ')[1]);
            if (wallets[address]) {
              wallets[address] -= prevTxOut.nValue / COIN;
            } else {
              wallets[address] = prevTxOut.nValue / COIN;
            }
          }
        }
      }
      for (let k = 0; k < tx.vout.length; k++) {
        let txout = tx.vout[k];
        // convert publicKey to publicKeyHash => address
        let address = getAddress(txout.scriptPubKey.split(' ')[1]);
        if (wallets[address]) {
          wallets[address] += txout.nValue / COIN;
        } else {
          wallets[address] = txout.nValue / COIN;
        }
      }
    }
  }
  return wallets;
}

export async function getWalletData(address) {
  let balance = 0;
  let utxoMap = { };
  // keep map of balances
  // for each txin, subtract from the address
  // for each txout, add to the address balance
  let blocks = await BlockModel.find({ }).sort({ timestamp: 1 });
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    for (let j = 0; j < block.txs.length; j++) {
      let tx = block.txs[j];
      for (let k = 0; k < tx.vin.length; k++) {
        let txin = tx.vin[k];
        if (txin.prevout != 'COINBASE') {
          // find amount from previout tx and subtract from address
          let prevTxBlock = await BlockModel.findOne({ "txs.hash": txin.prevout });
          if (prevTxBlock) {
            let prevTx = find(prevTxBlock.txs, ({ hash }) => hash === txin.prevout);
            let prevTxOut = prevTx.vout[txin.n];
            let txAddress = getAddress(prevTxOut.scriptPubKey.split(' ')[1]);
            if (txAddress == address) {
              balance -= prevTxOut.nValue / COIN;
              delete utxoMap[txin.prevout];
            }
          }
        }
      }
      for (let k = 0; k < tx.vout.length; k++) {
        let txout = tx.vout[k];
        // convert publicKey to publicKeyHash => address
        let txAddress = getAddress(txout.scriptPubKey.split(' ')[1]);
        if (txAddress == address) {
          balance += txout.nValue / COIN;
          utxoMap[tx.hash] = { nValue: txout.nValue / COIN, n: k };
        }
      }
    }
  }
  let utxo = Object.keys(utxoMap).map(txid => {
    return {
      txid: txid,
      nValue: utxoMap[txid].nValue,
      n: utxoMap[txid].n,
    };
  })
  return { utxo, balance };
}
