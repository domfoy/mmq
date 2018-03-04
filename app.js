const Session = require('./lib/session');

module.exports = init;

function init() {
  const session = new Session();

  return session.connect();
}
