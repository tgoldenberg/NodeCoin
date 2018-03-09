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
  unfetchedHeaders: [ ],
  newTransactions: [ ],
  orphanTransactions: [ ],
};

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
      let peerIdx = findIndex(state.allPeers, ({ ip }) => ip === action.ip);
      return {
        ...state,
        allPeers: peerIdx === -1 ? state.allPeers : [
          ...state.allPeers.slice(0, peerIdx),
          { ip: action.ip, client: action.client },
          ...state.allPeers.slice(peerIdx + 1),
        ],
      }
    default:
      return state;
  }
};

module.exports = nodeCoin;
