const config = require('config'),
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

  function joinGame() {
    socket.emit('game-client-join', {
      gameId,
      user
    });
    socket.emit('authentication', {
      username: undefined, // this.user.datas.username_canonical,
      password: undefined // this.user.datas.api_key
    });
  }
}

function basicLogger(data) {
  console.log(data);
}
