import network from 'network';

async function findIPAddress() {
  return new Promise((resolve, reject) => {
    network.get_public_ip((err, ip) => {
      if (err) {
        reject(err);
      }
      resolve(ip);
    });
  });
}

export default findIPAddress;
