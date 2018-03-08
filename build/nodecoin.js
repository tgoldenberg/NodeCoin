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
    // console.log('> prev state'.gray, store.getState().lastBlock);
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

var _blocks = __webpack_require__(24);

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
// const ipAddr = ip.address();
// const ipAddr = '192.168.1.150';

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

    console.log('> Connection data from: ' + remoteAddr, d);
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
        break;
      case 'GETBLOCKS':
        console.log('> Get Blocks: ', d);
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

    var ipAddr, dbConnection, server, client, _ref2, numBlocks, lastBlock, channel;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _findIPAddress2.default)();

          case 2:
            ipAddr = _context2.sent;

            console.log('> Server listening on port '.gray, process.env.PORT, ipAddr);

            // connect to local instance of MongoDB
            _context2.next = 6;
            return (0, _connectToDB2.default)();

          case 6:
            dbConnection = _context2.sent;

            console.log('> Connected to local MongoDB'.gray);

            // seed blocks
            // await seedBlocks();

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

            _context2.next = 14;
            return (0, _syncBlocksWithStore2.default)();

          case 14:
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

          case 22:
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
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(peer, lastBlockHash, version) {
    var _this = this;

    var IS_CONNECTED, IS_VERSION_COMPATIBLE, HAS_MORE_BLOCKS, port, client;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            IS_CONNECTED = false;
            IS_VERSION_COMPATIBLE = false;
            HAS_MORE_BLOCKS = false;
            // console.log('> Connecting with peer: ', peer, lastBlockHash, version);

            port = DEFAULT_PORT;
            client = new _net2.default.Socket();

            client.connect(port, peer.ip, function () {
              console.log('> Connected to peer: ', peer);
              IS_CONNECTED = true;
              var type = 'VERSION';
              client.write([type, version, lastBlockHash].join(' '));
            });

            client.on('data', function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
                var _data$toString$split, _data$toString$split2, type, args, version, blockHeaderHash, lastBlock, savedLastBlock, savedLastBlockHash;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _data$toString$split = data.toString().split(' '), _data$toString$split2 = _toArray(_data$toString$split), type = _data$toString$split2[0], args = _data$toString$split2.slice(1);
                        // console.log('> Received: ', data.toString());

                        version = void 0, blockHeaderHash = void 0;
                        _context.t0 = type;
                        _context.next = _context.t0 === 'VERSION' ? 5 : _context.t0 === 'GETBLOCKS' ? 21 : 21;
                        break;

                      case 5:
                        version = args[0];
                        blockHeaderHash = args[1];

                        if (!(version !== '1')) {
                          _context.next = 9;
                          break;
                        }

                        return _context.abrupt('break', 21);

                      case 9:
                        IS_VERSION_COMPATIBLE = true;
                        console.log('> Received block hash: ', blockHeaderHash);
                        // check db for what block height received block hash is
                        _context.next = 13;
                        return _Block2.default.findOne({ hash: blockHeaderHash });

                      case 13:
                        lastBlock = _context.sent;

                        if (lastBlock) {
                          _context.next = 19;
                          break;
                        }

                        // send getblocks message
                        savedLastBlock = _store2.default.getState().lastBlock;
                        savedLastBlockHash = savedLastBlock.getBlockHeaderHash();

                        client.write(['GETBLOCKS', savedLastBlockHash].join(' '));
                        return _context.abrupt('break', 21);

                      case 19:
                        console.log('> Synced with peer'.blue);
                        return _context.abrupt('break', 21);

                      case 21:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function (_x4) {
                return _ref2.apply(this, arguments);
              };
            }()
            // find next 50 blocks
            );

            client.on('close', function () {
              console.log('> Connection closed');
            });

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function connectWithPeer(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

__webpack_require__(2);

var _Block = __webpack_require__(20);

var _Block2 = _interopRequireDefault(_Block);

var _net = __webpack_require__(3);

var _net2 = _interopRequireDefault(_net);

var _store = __webpack_require__(1);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

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

            block = new _Block2.default({}, [], true);
            newBlock = new _Block4.default(block.getDBFormat());
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

  var newBlock = new _Block2.default(block, block.txs);
  newBlock.setHeader(block);
  return newBlock;
}

exports.default = syncBlocksWithStore;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsSha = __webpack_require__(19);

var _jsSha2 = _interopRequireDefault(_jsSha);

var _uuid = __webpack_require__(23);

var _uuid2 = _interopRequireDefault(_uuid);

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
  function Block(header, txs) {
    var isGenesis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, Block);

    var state = store.getState();
    this.header = {
      version: isGenesis ? 1 : header.version,
      previousHash: isGenesis ? genesisPreviousHash : header.previousHash,
      merkleHash: isGenesis ? genesisMerkleRoot : header.merkleHash,
      timestamp: isGenesis ? genesisTimestamp : header.timestamp,
      difficulty: isGenesis ? genesisDifficulty : header.difficulty,
      nonce: isGenesis ? genesisNonce : header.nonce
    };
    this.txs = [];
    if (isGenesis) {
      this.addTransaction(genesisTransaction);
    } else {
      this.txs = txs;
    }
    this.blocksize = JSON.stringify(this).length;
  }

  _createClass(Block, [{
    key: 'getDBFormat',
    value: function getDBFormat() {
      return {
        hash: this.getBlockHeaderHash(),
        version: this.header.version,
        previousHash: this.header.previousHash,
        merkleHash: this.header.merkleHash,
        timestamp: this.header.timestamp,
        difficulty: this.header.difficulty,
        nonce: this.header.nonce,
        txs: this.txs,
        blocksize: this.blocksize
      };
    }
  }, {
    key: 'getBlockHeaderHash',
    value: function getBlockHeaderHash() {
      var _header = this.header,
          version = _header.version,
          previousHash = _header.previousHash,
          merkleHash = _header.merkleHash,
          timestamp = _header.timestamp,
          difficulty = _header.difficulty,
          nonce = _header.nonce;

      return (0, _jsSha2.default)([version, previousHash, merkleHash, timestamp, difficulty, nonce].join(' '));
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
      var idx = this.txs.length;
      this.txs.push(_extends({}, transaction, { hash: (0, _jsSha2.default)(this.getBlockHeaderHash() + idx) }));
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
  hash: { type: String, required: true },
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

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seedBlocks = undefined;

var seedBlocks = exports.seedBlocks = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var genesisBlock, savedGenesisBlock, prev, remaining, i, amount, header, block, txId, transaction, newBlock;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _Block4.default.find({}).remove({});

          case 2:
            genesisBlock = new _Block2.default({}, [], true); // gives "myWallet" 50 COIN

            savedGenesisBlock = new _Block4.default(genesisBlock.getDBFormat());
            _context.next = 6;
            return savedGenesisBlock.save();

          case 6:
            prev = genesisBlock;
            remaining = 50 * COIN;
            i = 0;

          case 9:
            if (!(i < 3)) {
              _context.next = 24;
              break;
            }

            // 3 blocks (single transaction) sending money to friend wallet
            amount = Math.floor(Math.random() * 16);
            header = {
              version: 1,
              previousHash: prev.getBlockHeaderHash(),
              merkleHash: (0, _uuid2.default)(),
              timestamp: new Date().getTime(),
              difficulty: prev.header.difficulty,
              nonce: prev.header.nonce
            };
            block = new _Block2.default(header, []);
            txId = (0, _jsSha2.default)(block.getBlockHeaderHash() + '0');
            transaction = {
              vin: [{ n: 0, prevout: prev.txs[0].hash, scriptSig: (0, _validateSignature.unlockTransaction)(prev.txs[0].hash, myWallet.publicKeyHash, myWallet.privateKey) }],
              vout: [{ nValue: amount * COIN, scriptPubKey: (0, _validateSignature.lockTransaction)(txId, friendWallet.pulicKey) }, { nValue: remaining - amount * COIN, scriptPubKey: (0, _validateSignature.lockTransaction)(txId, myWallet.publicKey) }]
            };

            block.addTransaction(transaction);
            newBlock = new _Block4.default(block.getDBFormat());

            console.log('> New block: '.blue, newBlock.hash);
            _context.next = 20;
            return newBlock.save();

          case 20:
            prev = new _Block2.default(header, [transaction]);

          case 21:
            i++;
            _context.next = 9;
            break;

          case 24:
            return _context.abrupt('return', savedGenesisBlock);

          case 25:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function seedBlocks() {
    return _ref.apply(this, arguments);
  };
}();

// seedBlocks();


var _validateSignature = __webpack_require__(25);

var _Block = __webpack_require__(18);

var _Block2 = _interopRequireDefault(_Block);

var _Block3 = __webpack_require__(20);

var _Block4 = _interopRequireDefault(_Block3);

var _jsSha = __webpack_require__(19);

var _jsSha2 = _interopRequireDefault(_jsSha);

var _uuid = __webpack_require__(23);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var COIN = 100000000;

var myWallet = {
  privateKey: '0fcb37c77f68a69b76cd5b160ac9c85877b4e8a09d8bcde2c778715c27f9a347',
  publicKey: '044283eb5f9aa7421f646f266fbf5f7a72b7229a7b90a088d1fe45292844557b1d80ed9ac96d5b3ff8286e7794e05c28f70ae671c7fecd634dd278eb0373e6a3ba',
  publicKeyHash: 'ed2f84f67943321bf73747936db3e7273ada7f6c',
  address: '1Nd85AnFYDtaQAG6vF9FVWXFWksG5HuA3M',
  privateKeyWIF: '5HwF1jU38V8YhpBy9PuNC4hTYkKrDccLE28qV7tLxZ7u3pKXCy4'
};

var friendWallet = {
  privateKey: '6128428978e30fc034c95b7b091b373b875bdd73a0acf83c09d37bff72361349',
  publicKey: '04804a9ed2855fcea0f5b6e23e587a6c6f7159f15c84b9c82474231cfdac04827fac72a36bd0b463fc61c4d66a954aa7d5f95bde970804f81c8d6f712390516fbb',
  publicKeyHash: 'f3a7ee518818e7adc56ed12e9f483712fc4dd0d5',
  address: '1PDLNfJq5GAEn5StESZuBpaBe6B3134vmD',
  privateKeyWIF: '5JZ5LHz7Kr3FXeU7asLfffasonpmxUX3smTQb8LtsD21UQqiYqo'
};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.lockTransaction = lockTransaction;
exports.unlockTransaction = unlockTransaction;
exports.verifyUnlock = verifyUnlock;

var _ripemd = __webpack_require__(26);

var _ripemd2 = _interopRequireDefault(_ripemd);

var _jsSha = __webpack_require__(19);

var _jsSha2 = _interopRequireDefault(_jsSha);

var _elliptic = __webpack_require__(27);

var _elliptic2 = _interopRequireDefault(_elliptic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ec = new _elliptic2.default.ec('secp256k1');

var message = 'I want to send this money';
var publicKeyHash = 'bc6852feffa506e9bd20ab874f591488c94452b0';
var publicKey = '040b6e5e8aefa89e4d70e7f74c70dfffe10d9bae4a846213e15e485c1f8d1e1635c62f3e341498f00de895b687cae2a2e43a4808f4c75dd68122e159de7f4a0d96';
var publicAddress = '1JBD1dwNUAwVHXSPkpA3o27F6Qcv1yoc3u';
var privateKeyWif = '5JzAwuNcBrh9nd5xaLbvjWdaMriFyysRs711JtbH2RJtbwwTrTh';
var privateKey = '9a2481a0101b7d75062eea7d5e7689c3d8ec87209ae4c5f76dd5c0235a806fda';

var input = { message: message, publicKey: publicKey }; // we want to verify that this transaction belongs to us

// hash message - this method hashes the transaction header (# bytes, publicAddress, amount of money)
function Hash(msg) {
  var result = (0, _jsSha2.default)(msg);
  return new _ripemd2.default().update(msg).digest('hex');
}

function lockTransaction(message, publicKey) {
  var publicKeyScript = [encodeURIComponent(message), publicKey].join(' ');
  return publicKeyScript;
}

function unlockTransaction(message, publicAddress, privateKey) {
  var messageHash = Hash(decodeURIComponent(message));
  var privateKeyPair = ec.keyFromPrivate(privateKey);
  var signature = ec.sign(messageHash, privateKeyPair);
  return signature.toDER('hex');
}

function verifyUnlock(message, publicAddress, signature) {
  var messageHash = Hash(decodeURIComponent(message));
  var publicKeyPair = ec.keyFromPublic(publicAddress, 'hex');
  var isVerified = publicKeyPair.verify(messageHash, signature);
  return isVerified;
}

function testVerification(publicKeyScript, privateKey) {
  var _publicKeyScript$spli = publicKeyScript.split(' '),
      _publicKeyScript$spli2 = _slicedToArray(_publicKeyScript$spli, 2),
      message = _publicKeyScript$spli2[0],
      publicKey = _publicKeyScript$spli2[1];

  var signature = unlockTransaction(message, publicKey, privateKey);
  // console.log('> Signature: ', signature);
  var isVerified = verifyUnlock(message, publicKey, signature);
  // console.log('> Is verified: ', isVerified);
}

var publicKeyScript = lockTransaction(input.message, input.publicKey);
// testVerification(publicKeyScript, privateKey);

publicKeyScript = lockTransaction(input.message, '04487bd002b2b61a1bbc89b3c05cebf73039d4722c96877308ee4905c10f155d71f03dca22650a2aea193416dd5071260b3fca82ab5a254163371e5929fb28c0f2');
// testVerification(publicKeyScript, privateKey); // different address

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("ripemd160");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("elliptic");

/***/ })
/******/ ]);
});
//# sourceMappingURL=nodecoin.js.map