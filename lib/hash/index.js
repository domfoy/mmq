const crypto = require('crypto');

module.exports = hash;

function hash(stream) {
  const h = crypto.createHash('sha1');

  stream.on('data', (data) => {
    h.update(data, 'binary');
  });

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      const result = h.digest('hex');
      resolve(result);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}
