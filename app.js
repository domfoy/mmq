const initSocket = require('./lib/socket');
const getUser = require('./lib/user');

module.exports = init;

function init() {
  return getUser()
    .then(initSocket);
}
