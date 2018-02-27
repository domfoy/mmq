const config = require('config'),
      socketIO = require('socket.io-client');

const {
  onSongStart,
  onSongEnd,
  onGameInfo,
  onDisconnect
} = require('./handlers');

const {socketUrl: url, gameId} = config;

module.exports = init;

function init(user) {
  const socket = socketIO(url);

  socket.on('connect', () => {
    joinGame();
  });
  socket.on('game-server-song-start', onSongStart);
  socket.on('game-server-song-end', onSongEnd);
  socket.on('game-info', onGameInfo);
  socket.on('disconnect', onDisconnect);

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
