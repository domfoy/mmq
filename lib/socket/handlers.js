const config = require('config'),
      axios = require('axios');

const headers = require('../headers');
const hash = require('../hash');
const {Track} = require('../../model');

const onGameInfo = basicLogger;
const onDisconnect = basicLogger;

module.exports = {
  onSongStart,
  onSongEnd,
  onGameInfo,
  onDisconnect
};

let generatedHash;

async function onSongStart(data) {
  const {link} = data.parameters;
  const url = `${config.host}/tmp/${link}`;
  const {data: tmpStream} = await axios.get(url, {
    headers,
    responseType: 'stream'
  });

  generatedHash = await hash(tmpStream);
  console.log('generated hash', generatedHash);
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
    audioHashes: [{
      hash: generatedHash,
      date: new Date()
    }]
  };

  const dbTrack = await Track.findOne({
    title,
    artist
  }).exec();

  if (!dbTrack && title && artist && generatedHash) {
    await Track.create(track);
  }

  generatedHash = undefined;
}

function basicLogger(data) {
  console.log(data);
}
