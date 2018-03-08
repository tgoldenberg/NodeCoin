import mongoose from 'mongoose';

async function connectToDB() {
  return new Promise((resolve, reject) => {
    mongoose.connect('mongodb://localhost:27017/nodecoin', (err) => {
      if (err) {
        throw new Error(`Error connecting to mongo. ${err}`);
        reject(err);
      } else {
        // console.log('> Successfully conected to MongoDB 🔐');
        resolve(true);
      }
    });
  });
}

export default connectToDB;
