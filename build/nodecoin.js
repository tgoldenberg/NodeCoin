(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["events"] = factory();
	else
		root["events"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(2);

var reducer = __webpack_require__(15);

var Redux = __webpack_require__(16);

var store = Redux.createStore(reducer);

store.dispatch = addLoggingToDispatch(store);

function addLoggingToDispatch(store) {
  var rawDispatch = store.dispatch;
  return function (action) {
    console.log(('> Action: ' + action.type).yellow);
    // console.log('> prev state'.gray, store.getState());
    console.log(('> Keys: ' + Object.keys(action).join(', ')).green);
    var returnValue = rawDispatch(action);
    // console.log('> next state'.green, store.getState());
    // console.log(action.type.green);
    return returnValue;
  };
}

module.exports = store;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("colors");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("network");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(2);

__webpack_require__(6);

var _pusherJs = __webpack_require__(7);

var _pusherJs2 = _interopRequireDefault(_pusherJs);

var _lodash = __webpack_require__(8);

var _lodash2 = _interopRequireDefault(_lodash);

var _bodyParser = __webpack_require__(9);

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _connectToDB = __webpack_require__(10);

var _connectToDB2 = _interopRequireDefault(_connectToDB);

var _connectWithPeer = __webpack_require__(11);

var _connectWithPeer2 = _interopRequireDefault(_connectWithPeer);

var _express = __webpack_require__(12);

var _express2 = _interopRequireDefault(_express);

var _findIPAddress = __webpack_require__(13);

var _findIPAddress2 = _interopRequireDefault(_findIPAddress);

var _ip = __webpack_require__(14);

var _ip2 = _interopRequireDefault(_ip);

var _mongoose = __webpack_require__(0);

var _mongoose2 = _interopRequireDefault(_mongoose);

var _net = __webpack_require__(3);

var _net2 = _interopRequireDefault(_net);

var _network = __webpack_require__(4);

var _network2 = _interopRequireDefault(_network);

var _store = __webpack_require__(1);

var _store2 = _interopRequireDefault(_store);

var _syncBlocksWithStore = __webpack_require__(17);

var _syncBlocksWithStore2 = _interopRequireDefault(_syncBlocksWithStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

__webpack_require__(22).config();

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

// get current IP address in use
var ipAddr = _ip2.default.address();
// const ipAddr = '108.30.188.4';

var PUSHER_APP_KEY = '86e36fb6cb404d67a108'; // connect via public key
var DEFAULT_PORT = 8334; // default port for net connections
var MAX_PEERS = 25;

function handleConnection(conn) {
  var remoteAddr = conn.remoteAddress + ':' + conn.remotePort;
  console.log(('> New client connection from ' + remoteAddr).blue);

  conn.setEncoding('utf8');
  conn.on('data', onConnData);
  conn.on('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    var _d$split = d.split(' '),
        _d$split2 = _toArray(_d$split),
        type = _d$split2[0],
        args = _d$split2.slice(1);

    console.log('> Connection data from: ' + remoteAddr, d, type);
    var version = void 0,
        lastBlockHash = void 0,
        state = void 0,
        lastBlock = void 0;
    switch (type) {
      case 'VERSION':
        version = args[0];
        lastBlockHash = args[1];
        state = _store2.default.getState();
        lastBlock = state.lastBlock;
        console.log('> Responding to VERSION request');
        conn.write(['VERSION', lastBlock.header.version, lastBlock.getBlockHeaderHash()].join(' '));
    }
  }
  function onConnClose() {
    console.log('connection from %s closed', remoteAddr);
  }
  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddr, err.message);
  }
}

var allPeers = [];

function startup() {
  app.listen(process.env.PORT || 3000, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var _this = this;

    var dbConnection, server, client, _ref2, numBlocks, lastBlock, channel;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // const ipAddr = await findIPAddress();
            console.log('> Server listening on port '.gray, process.env.PORT, ipAddr);

            // connect to local instance of MongoDB
            _context2.next = 3;
            return (0, _connectToDB2.default)();

          case 3:
            dbConnection = _context2.sent;

            console.log('> Connected to local MongoDB'.gray);

            // create a TCP/IP server on current IP address
            server = _net2.default.createServer();

            server.on('connection', handleConnection);

            server.listen(DEFAULT_PORT, '0.0.0.0', function () {
              console.log('> TCP/IP server listening on:'.gray, JSON.stringify(server.address()));
            });

            // initialize presence channel via Pusher
            client = new _pusherJs2.default(PUSHER_APP_KEY, {
              auth: { params: { ip_addr: ipAddr, port: 8334 } },
              cluster: 'us2',
              authEndpoint: 'https://pusher-presence-auth.herokuapp.com/pusher/auth',
              encrypted: true
            });

            // initialize blockchain (MongoDB local)

            _context2.next = 11;
            return (0, _syncBlocksWithStore2.default)();

          case 11:
            _ref2 = _context2.sent;
            numBlocks = _ref2.numBlocks;
            lastBlock = _ref2.lastBlock;


            console.log('> Subscribing to broadcast changes...'.gray);
            channel = client.subscribe('presence-node-coin');

            // SUCCESSFULLY JOINED

            channel.bind('pusher:subscription_succeeded', function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(members) {
                var lastBlock, lastBlockHash, version, i, peer;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        console.log('> Subscription succeeded: ', members);
                        allPeers = [];
                        channel.members.each(function (member) {
                          if (member.id !== ipAddr) {
                            allPeers.push({ ip: member.id });
                          }
                        });
                        allPeers = allPeers.slice(0, MAX_PEERS);
                        // console.log('> All peers: ', allPeers);
                        _store2.default.dispatch({ type: 'SET_PEERS', allPeers: allPeers });
                        lastBlock = _store2.default.getState().lastBlock;
                        lastBlockHash = lastBlock.getBlockHeaderHash();
                        version = lastBlock.header.version;
                        // console.log('> Last block hash: ', version, lastBlockHash);

                        // send version message to all peers, w/ version and last block hash

                        i = 0;

                      case 9:
                        if (!(i < allPeers.length)) {
                          _context.next = 16;
                          break;
                        }

                        peer = allPeers[i];
                        _context.next = 13;
                        return (0, _connectWithPeer2.default)(peer, lastBlockHash, version);

                      case 13:
                        i++;
                        _context.next = 9;
                        break;

                      case 16:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function (_x) {
                return _ref3.apply(this, arguments);
              };
            }());

            // MEMBER ADDED
            channel.bind('pusher:member_added', function (member) {
              var allPeers = _store2.default.getState().allPeers;
              allPeers.push({ ip: member.id });
              _store2.default.dispatch({ type: 'SET_PEERS', allPeers: allPeers });
              // TODO: send ping to new member to exchange headers
            });

            // MEMBER REMOVED
            channel.bind('pusher:member_removed', function (member) {
              console.log('> Member removed: ', member);
              var allPeers = _store2.default.getState().allPeers;
              var newAllPeers = [];
              allPeers.forEach(function (peer) {
                if (peer.ip !== member.id) {
                  newAllPeers.push(peer);
                }
              });
              _store2.default.dispatch({ type: 'SET_PEERS', allPeers: newAllPeers });
              // TODO: stop any ongoing requests with peer
            });

          case 19:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
}

startup();

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("pusher-js");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var connectToDB = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              _mongoose2.default.connect('mongodb://localhost:27017/nodecoin', function (err) {
                if (err) {
                  throw new Error('Error connecting to mongo. ' + err);
                  reject(err);
                } else {
                  // console.log('> Successfully conected to MongoDB 🔐');
                  resolve(true);
                }
              });
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function connectToDB() {
    return _ref.apply(this, arguments);
  };
}();

var _mongoose = __webpack_require__(0);

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = connectToDB;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var connectWithPeer = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(peer, lastBlockHash, version) {
    var port, client;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('> Connecting with peer: ', peer, lastBlockHash, version);
            port = DEFAULT_PORT;
            client = new _net2.default.Socket();

            client.connect(port, peer.ip, function () {
              console.log('> Connected to peer: ', peer);
              var type = 'VERSION';
              client.write([type, version, lastBlockHash].join(' '));
            });

            client.on('data', function (data) {
              console.log('> Received: ', data.toString());
            });

            client.on('close', function () {
              console.log('> Connection closed');
            });

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function connectWithPeer(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _net = __webpack_require__(3);

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var DEFAULT_PORT = 8334;

exports.default = connectWithPeer;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var findIPAddress = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              _network2.default.get_public_ip(function (err, ip) {
                if (err) {
                  reject(err);
                }
                resolve(ip);
              });
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function findIPAddress() {
    return _ref.apply(this, arguments);
  };
}();

var _network = __webpack_require__(4);

var _network2 = _interopRequireDefault(_network);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = findIPAddress;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("ip");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = _defineProperty({
  /*
    this checks at start, connect to local mongo and load number of blocks -
    let count = await Blocks.find({}).count();
    Then load these variables.
    If count == 0, hard code genesis block, then emit last block to peers
    If count > 0, find last block - await Blocks.find({ }).sort({ timestamp: -1 }).limit(1);
    Emit last block to peers to receive remaining blocks
  */
  dbLoaded: false,
  numBlocks: 0,
  allPeers: [], // list of { ip: String, port: Number }
  lastBlock: null,
  version: 1,
  nonce: 0,
  difficulty: 0
}, 'numBlocks', 0);

var nodeCoin = function nodeCoin() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case 'SET_INITIAL_BLOCK_COUNT':
      return _extends({}, state, {
        dbLoaded: true,
        lastBlock: action.lastBlock,
        numBlocks: action.numBlocks
      });
    case 'SET_NONCE':
      return _extends({}, state, {
        difficulty: action.difficulty,
        nonce: action.nonce
      });
    case 'SET_PEERS':
      return _extends({}, state, { allPeers: action.allPeers });
    default:
      return state;
  }
};

module.exports = nodeCoin;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var syncBlocksWithStore = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var numBlocks, lastBlock, block, newBlock, _lastBlock, difficulty, nonce;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _Block4.default.count();

          case 2:
            numBlocks = _context.sent;
            _context.next = 5;
            return _Block4.default.findOne().sort({ timestamp: -1 }).limit(1);

          case 5:
            lastBlock = _context.sent;

            if (!(numBlocks <= 0)) {
              _context.next = 12;
              break;
            }

            block = new _Block2.default(null, true);
            newBlock = new _Block4.default({
              version: block.header.version,
              previousHash: block.header.previousHash,
              merkleHash: block.header.merkleHash,
              timestamp: block.header.timestamp,
              difficulty: block.header.difficulty,
              nonce: block.header.nonce,
              txs: block.txs,
              blocksize: block.blocksize
            });
            _context.next = 11;
            return newBlock.save();

          case 11:
            lastBlock = newBlock;

          case 12:
            _lastBlock = lastBlock, difficulty = _lastBlock.difficulty, nonce = _lastBlock.nonce;
            // update Redux store

            _store2.default.dispatch({ type: 'SET_NONCE', difficulty: difficulty, nonce: nonce });
            _store2.default.dispatch({ type: 'SET_INITIAL_BLOCK_COUNT', lastBlock: formatBlock(lastBlock), numBlocks: numBlocks });
            return _context.abrupt('return', { numBlocks: numBlocks, lastBlock: lastBlock });

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function syncBlocksWithStore() {
    return _ref.apply(this, arguments);
  };
}();

var _Block = __webpack_require__(18);

var _Block2 = _interopRequireDefault(_Block);

var _Block3 = __webpack_require__(20);

var _Block4 = _interopRequireDefault(_Block3);

var _store = __webpack_require__(1);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function formatBlock(block) {
  var newBlock = new _Block2.default(block.previousHash, false, block.timestamp);
  newBlock.setHeader(block);
  return newBlock;
}

exports.default = syncBlocksWithStore;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsSha = __webpack_require__(19);

var _jsSha2 = _interopRequireDefault(_jsSha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var store = __webpack_require__(1);

var COIN = 100000000;
var genesisPreviousHash = '0000000000000000000000000000000000000000000000000000000000000000';
var genesisMerkleRoot = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';
var genesisDifficulty = 486604799;
var genesisNonce = 2083236893;
var genesisTimestamp = 1231006505000; // Jan 3, 2009
var genesisTransaction = {
  vin: [{ n: 'COINBASE', prevout: null }],
  vout: [{ nValue: 50 * COIN, scriptPubKey: '1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M' }]
};

var Block = function () {
  function Block(previousHash) {
    var isGenesis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var timestamp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Date.now();

    _classCallCheck(this, Block);

    var state = store.getState();
    this.header = {
      version: state.version,
      previousHash: isGenesis ? genesisPreviousHash : previousHash,
      merkleHash: isGenesis ? genesisMerkleRoot : null,
      timestamp: isGenesis ? genesisTimestamp : timestamp,
      difficulty: isGenesis ? genesisDifficulty : state.difficulty,
      nonce: isGenesis ? genesisNonce : state.nonce
    };
    this.txs = [];
    if (isGenesis) {
      this.addTransaction(genesisTransaction);
    }
    this.blocksize = JSON.stringify(this).length;
  }

  _createClass(Block, [{
    key: 'getBlockHeaderHash',
    value: function getBlockHeaderHash() {
      var _header = this.header,
          version = _header.version,
          previousHash = _header.previousHash,
          merkleHash = _header.merkleHash,
          timestamp = _header.timestamp,
          difficulty = _header.difficulty,
          nonce = _header.nonce;

      return (0, _jsSha2.default)([version, previousHash, merkleHash, timestamp, difficulty, nonce, JSON.stringify(this.txs)].join(' '));
    }
  }, {
    key: 'setHeader',
    value: function setHeader(header) {
      this.header = {
        version: header.version,
        previousHash: header.previousHash,
        merkleHash: header.merkleHash,
        timestamp: header.timestamp,
        difficulty: header.difficulty,
        nonce: header.nonce
      };
      return this.header;
    }
  }, {
    key: 'addTransaction',
    value: function addTransaction(transaction) {
      this.txs.push(transaction);
      return this.txs;
    }
  }]);

  return Block;
}();

;

// let block = new Block(null, true); // genesis block
// console.log('> Genesis block: ', block);

module.exports = Block;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("js-sha256");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = __webpack_require__(0);

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = __webpack_require__(21);

var schema = {
  version: { default: 1, type: Number },
  previousHash: { type: String, required: true },
  merkleHash: { type: String, required: true },
  timestamp: { type: Number, required: true },
  difficulty: { type: Number, required: true },
  nonce: { type: Number, required: true },
  txs: { type: Array, default: [] },
  blocksize: { type: Number, required: true }
};

var BlockSchema = new _mongoose2.default.Schema(schema);

var BlockModel = _mongoose2.default.model('blocks', BlockSchema);

exports.default = BlockModel;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ })
/******/ ]);
});
//# sourceMappingURL=nodecoin.js.map