const config = require('config'),
      axios = require('axios');

const headers = require('../headers');
const hash = require('../hash');
const {Track} = require('../../model');

class RoundManager {
  constructor() {
    this.reset();
  }

  reset() {
    Object.assign(this, {
      currentHash: undefined,
      track: {},
      guessedTrack: undefined,
      round: {},
      songStartTime: undefined
    });
  }

  async onSongStart(data) {
    this.songStartTime = new Date();
    console.log('Song start', data.parameters);

    const {link} = data.parameters;
    const url = `${config.host}/tmp/${link}`;
    const {data: tmpStream} = await axios.get(url, {
      headers,
      responseType: 'stream'
    });

    this.currentHash = await hash(tmpStream);
    console.log('Current hash', this.currentHash);

    const guessedTrack = await Track.findOne({'audioHashes.hash': this.currentHash}).exec();

    if (guessedTrack) {
      console.log('Guess found', guessedTrack);
      console.log('Computation took:', new Date() - this.songStartTime, 'ms');
      this.guessedTrack = guessedTrack;
      // this.answer();
    } else {
      console.log('No guess found');
    }
  }

  async onSongEnd(data) {
    console.log('Song end', data.parameters);

    const {
      field_one: title,
      field_two: artist,
      cover_path: cover,
      file_path: filePath,
      created_at: createdAt,
      updated_at: updatedAt,
      link
    } = data.parameters;

    this.track = {
      title,
      artist,
      link,
      cover,
      filePath,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      audioHashes: [{
        hash: this.currentHash,
        date: new Date()
      }]
    };

    console.log('Answer track received', this.track);
    if (!(this.track.title && this.track.artist && this.currentHash)) {
      return;
    }
    const dbTrack = await Track.findOne({
      title,
      artist
    }).exec();

    if (!dbTrack) {
      console.log('New track added', this.currentHash);
      await Track.create(this.track);
    } else if (this.guessedTrack && this.guessedTrack._id.$id !== dbTrack._id.$id) {
      console.log('Wrong guess', this.guessedTrack);
      await dbTrack.update({$push: {audioHashes: this.track.audioHashes[0]}}).exec();
    }

    Object.assign(this, {
      currentHash: undefined,
      track: {},
      guessedTrack: undefined,
      round: {},
      songStartTime: undefined
    });
  }
}

module.exports = RoundManager;
