const {test} = require('ava');

const db = require('../db.js');

const {onSongEnd} = require('../lib/socket/handlers');

const data = {
  field_one: 'Walk On By',
  field_two: 'Dionne Warwick',
  cover_path: 'cover/11223',
  created_at: new Date(),
  updated_at: new Date(),
  link: '/tmp/11223.mp3'
};

test('should save new track and round', async (t) => {
  await db.connect();

  await onSongEnd(data);

  t.pass();
});
