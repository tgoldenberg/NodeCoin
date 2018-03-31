import mongoose from 'mongoose';

async function connectToDB() {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGO_URL, (err) => {
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
