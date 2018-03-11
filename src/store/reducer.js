import findIndex from 'lodash/findIndex';

const initialState = {
  /*
    this checks at start, connect to local mongo and load number of blocks -
    let count = await Blocks.find({}).count();
    Then load these variables.
    If count == 0, hard code genesis block, then emit last block to peers
    If count > 0, find last block - await Blocks.find({ }).sort({ timestamp: -1 }).limit(1);
    Emit last block to peers to receive remaining blocks
  */
  // Initialization
  dbLoaded: false,
  lastBlock: null,
  allPeers: [ ], // list of { ip: String, port: Number }
  version: 1,
  difficulty: 0,
  numBlocks: 0,
  // Mempool
  memoryPool: [ ], // list of valid transactions (txs)
  pendingBlockTxs: [ ],
  unfetchedHeaders: new Set(),
  loadingHeaders: new Set(),
  orphanTransactions: new Set(),
  // Mining
  isMining: false,
};

let newUnfetchedHeaders, newLoadingHeaders, peerIdx, newMemoryPool, tempMempool;

const nodeCoin = (state = initialState, action) => {
  switch(action.type) {
    case 'SET_INITIAL_BLOCK_COUNT':
      return {
        ...state,
        dbLoaded: true,
        lastBlock: action.lastBlock,
        numBlocks: action.numBlocks,
      };
    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.difficulty,
      };
    case 'SET_PEERS':
      return { ...state, allPeers: action.allPeers };
    case 'CONNECT_PEER':
      peerIdx = findIndex(state.allPeers, ({ ip }) => ip === action.ip);
      return {
        ...state,
        allPeers: peerIdx === -1 ? state.allPeers : [
          ...state.allPeers.slice(0, peerIdx),
          { ip: action.ip, client: action.client, synced: false, connected: true },
          ...state.allPeers.slice(peerIdx + 1),
        ],
      }
    case 'ADD_UNFETCHED_HEADERS':
      return {
        ...state,
        unfetchedHeaders: new Set([
          ...Array.from(state.unfetchedHeaders),
          ...action.headers,
        ]),
      };
    case 'LOADING_BLOCK':
      newUnfetchedHeaders = state.unfetchedHeaders;
      newUnfetchedHeaders.delete(action.header);
      newLoadingHeaders = state.loadingHeaders;
      newLoadingHeaders.add(action.header);
      return {
        ...state,
        unfetchedHeaders: newUnfetchedHeaders,
        loadingHeaders: newLoadingHeaders,
      };
    case 'NEW_BLOCK':
      newUnfetchedHeaders = state.unfetchedHeaders;
      newUnfetchedHeaders.delete(action.header);
      newLoadingHeaders = state.loadingHeaders;
      newLoadingHeaders.delete(action.header);
      return {
        ...state,
        lastBlock: action.block,
        numBlocks: state.numBlocks + 1,
        unfetchedHeaders: newUnfetchedHeaders,
        loadingHeaders: newLoadingHeaders,
      };
    case 'SYNC_PEER':
      peerIdx = findIndex(state.allPeers, ({ ip }) => ip === action.ip);
      return {
        ...state,
        allPeers: peerIdx === -1 ? state.allPeers : [
          ...state.allPeers.slice(0, peerIdx),
          { ...state.allPeers[peerIdx], synced: true, connected: true },
          ...state.allPeers.slice(peerIdx + 1),
        ],
      };
    case 'NEW_TX':
      return {
        ...state,
        memoryPool: [ ...state.memoryPool, action.tx ],
      };
    case 'START_MINING':
      return { ...state, isMining: true };
    case 'STOP_MINING':
      tempMempool = state.memoryPool;
      return { ...state, isMining: false, memoryPool: [], pendingBlockTxs: tempMempool };
    default:
      return state;
  }
};

module.exports = nodeCoin;
