const initialState = {
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
  allPeers: [ ], // list of { ip: String, port: Number }
  lastBlock: null,
  version: 1,
  nonce: 0,
  difficulty: 0,
  numBlocks: 0,
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
    case 'SET_NONCE':
      return {
        ...state,
        difficulty: action.difficulty,
        nonce: action.nonce,
      };
    case 'SET_PEERS':
      return { ...state, allPeers: action.allPeers };
    default:
      return state;
  }
};

module.exports = nodeCoin;