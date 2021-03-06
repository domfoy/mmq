const fs = require('fs');

const config = require('config'),
      {test} = require('ava'),
      nock = require('nock'),
      socketIO = require('socket.io');

const db = require('../db.js');
const initApp = require('../app.js');

const html = fs.readFileSync('./test/data/home.html', 'utf-8');

const server = require('http').createServer();

server.listen(3000);

const scope = nock(config.mmqHomeUrl)
  .get('/')
  .reply(200, html);

test('should save new track and round', async (t) => {
  t.plan(2);
  const io = socketIO(server);
  io.on('connection', (socket) => {
    console.log('connectssssion');
    // socket.emit('disconnect', {t: 1});
    socket.on('game-client-join', (data) => {
      t.pass();
      console.log(data);
    });
    socket.local.emit('game-server-song-end', {
      field_one: 'Walk On By',
      field_two: 'Dionne Warwick',
      cover_path: 'cover/11223',
      created_at: new Date(),
      updated_at: new Date(),
      link: '/tmp/11223.mp3'
    });
  });

  await db.connect();

  await initApp();

  // t.true(scope.isDone());
  t.pass();
});
