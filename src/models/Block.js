import mongoose from 'mongoose';

mongoose.Promise = require('bluebird');

const schema = {
  version: { default: 1, type: Number },
  previousHash: { type: String, required: true },
  merkleHash: { type: String, required: true },
  timestamp: { type: Number, required: true },
  difficulty: { type: Number, required: true },
  nonce: { type: Number, required: true },
  txs: { type: Array, default: [ ] },
  blocksize: { type: Number, required: true },
};

const BlockSchema = new mongoose.Schema(schema);

const BlockModel = mongoose.model('blocks', BlockSchema);

export default BlockModel;
