# NodeCoin
Implementation of Bitcoin / cryptocurrency using NodeJS

#### Resources

* [A blockchain in 200 loc - Medium piece](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54)

* [Naivecoin: tutorial to build blockchain](https://lhartikk.github.io/) - actually pretty good

* [Pycoin - Bitcoin implementation in Python](https://github.com/ricmoo/pycoind/blob/master/README.md#node-management-pycoind-node)

#### Getting Started

Simply run the start-up script:

```
npm start [public-address]
```
The *public-address* argument will set your NodeCoin public address. Otherwise, the program will create a new address and add it to the blockchain.


#### Redux

Use redux for local variable storage (get/set behavior)

#### MongoDB

Use local MongoDB to store blocks. We can also keep track of UTXO (unspent transaction outputs).

Transactions that are not yet added to the block can be added to the mempool.

Orphan transactions can be added to the orphan transaction pool.

Further, we can create balances for users (by wallet address)
