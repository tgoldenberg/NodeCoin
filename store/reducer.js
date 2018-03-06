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
  peers: [ ], // list of { ip: String, port: Number }
};

const nodeCoin = (state = initialState, action) => {
  switch(action.type) {
    default:
      return state;
  }
};

module.exports = nodeCoin;
