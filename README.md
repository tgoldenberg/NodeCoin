# NodeCoin
Implementation of Bitcoin / cryptocurrency using NodeJS

#### Resources

* [A blockchain in 200 loc - Medium piece](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54)

* [Naivecoin: tutorial to build blockchain](https://lhartikk.github.io/) - actually pretty good

* [Pycoin - Bitcoin implementation in Python](https://github.com/ricmoo/pycoind/blob/master/README.md#node-management-pycoind-node)

#### Getting Started

The following dependencies must be installed before running:

* MongoDB - you can follow the [installation instructions](https://treehouse.github.io/installation-guides/mac/mongo-mac.html) here. You will want a db called "nodecoin" that you can access.

* NPM - Node Package Manager - make sure you are on the latest version of NodeJS

Then install the JavaScript dependencies:

```
npm insall
```

Simply run the start-up script:

```
npm start
```

This will add your computer to the pool of computers running NodeCoin. You should see a connection message, after which the program will sync with other computers.

#### Creating an Address

Once the program is running, in a separate terminal tab, type:

```
curl -XGET localhost:3000/wallets | python -m json.tool
```

This will provide all currently available wallet addresses and their balance. If you have not made a transaction, yours will not show up here.

For a specific wallet balance and unspent transaction outputs (UTXO), type:

```
curl -XGET localhost:3000/wallets/1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M | python -m json.tool
```

Here you can replace "1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M" with "WALLET_ADDRESS"

You can also generate a new wallet:

```
curl -XPOST localhost:3000/wallets/new | python -m json.tool
```

This will provide you with a new:

* privateKey
* publicKey
* publicKeyHash (sha-256 encrypted version of public key)
* privateKeyWif ("WIF" (wallet-import-format) version of private key)
* address (base58-encoded version of publicKeyHash)

You can use the private and public keys to send and recieve NodeCoin.

To send money:

```

```


#### Redux

We use redux for local variable storage (get/set behavior)

#### MongoDB

We use a local MongoDB to store blocks. We can also keep track of UTXO (unspent transaction outputs).

Transactions that are not yet added to the block can be added to the mempool.

Orphan transactions can be added to the orphan transaction pool.

Further, we can create balances for users (by wallet address)
