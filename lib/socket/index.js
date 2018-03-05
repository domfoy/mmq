const config = require('config'),
      _ = require('lodash'),
      socketIO = require('socket.io-client');

const RoundManager = require('./round-manager');

const {socketUrl: url, gameId} = config;

module.exports = init;

function init(user) {
  const socket = socketIO(url);
  const roundManager = new RoundManager(socket, user);

  socket.on('connect', () => {
    joinGame();
  });
  socket.on('game-server-song-start', roundManager.onSongStart.bind(roundManager));
  socket.on('game-server-song-end', roundManager.onSongEnd.bind(roundManager));
  socket.on('game-init-server', basicLogger);
  socket.on('game-server-start', basicLogger);
  socket.on('game-join', basicLogger);
  socket.on('game-info', roundManager.onGameInfo.bind(roundManager));
  socket.on('game-server-song-response-result', (data) => {
    console.log('Response result from server', data);
  });
  socket.on('game-server-status', basicLogger);
  socket.on('game-server-end', basicLogger);
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
