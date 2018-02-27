const config = require('config'),
      axios = require('axios');

const headers = require('../headers');
const {Track} = require('../../model');

const onGameInfo = basicLogger;
const onDisconnect = basicLogger;

module.exports = {
  onSongStart,
  onSongEnd,
  onGameInfo,
  onDisconnect
};

let file;

async function onSongStart(data) {
  const {link} = data.parameters;
  const url = `${config.host}/tmp/${link}`;
  const {data: tmpFile} = await axios.get(url, {
    headers
  });

  file = tmpFile;
}

async function onSongEnd(data) {
  const {
    field_one: title,
    field_two: artist,
    cover_path: cover,
    file_path: filePath,
    created_at: createdAt,
    updated_at: updatedAt,
    link
  } = data.parameters;

  const track = {
    title,
    artist,
    link,
    cover,
    filePath,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    file
  };

  const dbTrack = await Track.findOne({
    title,
    artist
  }).exec();

  if (!dbTrack) {
    await Track.create(track);
  }
}

function basicLogger() {
  // console.log(data);
}
