const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = Promise;

function connect() {
  return mongoose.connect(config.dbUrl);
}

function disconnect() {
  return mongoose.disconnect();
}

module.exports = {
  connect,
  disconnect
};
