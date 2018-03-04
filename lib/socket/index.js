const config = require('config'),
      _ = require('lodash'),
      socketIO = require('socket.io-client');

const RoundManager = require('./round-manager');

const {socketUrl: url, gameId} = config;

module.exports = init;

function init(user) {
  const socket = socketIO(url);
  const roundManager = new RoundManager();

  socket.on('connect', () => {
    joinGame();
  });
  socket.on('game-server-song-start', roundManager.onSongStart);
  socket.on('game-server-song-end', roundManager.onSongEnd);
  socket.on('game-info', basicLogger);
  socket.on('disconnect', basicLogger);
  socket.on('authentication-success', () => {
    console.log('Socket authentication succeeded');
    socket.emit('game-client-start', {gameId: 'facile', user});
  });

  function joinGame() {
    socket.emit('game-client-join', {
      gameId,
      user
    });
    socket.emit('authentication', {
      username: _.get(user.datas, 'username_canonical'),
      password: _.get(user.datas, 'api_key')
    });
  }
}

function basicLogger(data) {
  console.log(data);
}
