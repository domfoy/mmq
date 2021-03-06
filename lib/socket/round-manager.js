const config = require('config'),
      axios = require('axios'),
      _ = require('lodash');

const headers = require('../headers');
const hash = require('../hash');
const {Track} = require('../../model');
const {perfect, laborious} = require('../strategies');

const MODE = {
  IDLE: 'idle',
  NORMAL: 'normal',
  PERFECT: 'perfect'
};

const WAITING_TIME_THRESHOLD = 4000;
const RESPONSE_TIME_LIMIT = 10000;

class RoundManager {
  constructor(socket, user) {
    this.user = user;
    this.socket = socket;
    this.send = createSend(socket);
    this.reset();
  }

  reset() {
    Object.assign(this, {
      currentHash: undefined,
      track: {},
      guessedTrack: undefined,
      round: {},
      songStartTime: undefined,
      players: []
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
      answer(this);
    } else {
      console.log('No guess found');
    }
  }

  async onSongEnd(data) {
    console.log('Song end', data.parameters);
    this.players = data.players;

    if (config.connect) {
      this.behaviour = assessBehaviour(this.user, this.players);
      console.log('Next behaviour', this.behaviour);
    }

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
      console.log('Did not track correctly info', this.track.title, this.track.artist, this.currentHash);
      return;
    }
    const dbTrack = await Track.findOne({
      title,
      artist
    }).exec();

    if (!dbTrack) {
      console.log('New track added', this.track);
      await Track.create(this.track);
    } else {
      const hashes = _.map(dbTrack.audioHashes, 'hash');

      if (!hashes.includes(this.currentHash)) {
        console.log('New hash added', dbTrack, this.currentHash);
        await dbTrack.update({$push: {audioHashes: this.track.audioHashes[0]}}).exec();
      }
    }

    if (this.guessedTrack && this.guessedTrack._id.$id !== dbTrack._id.$id) {
      console.warn('Wrong guess', this.guessedTrack);
    }

    this.reset();
  }

  onGameInfo(data) {
    const elapsedTime = new Date() - this.songStartTime;
    console.log(elapsedTime, data.state);
  }
}

function assessBehaviour(user, players) {
  const allPlayers = players.length;
  const me = _.find(players, {id: user.datas.id});
  if (!me) {
    console.warn('Current user not found among players');
    return MODE.IDLE;
  }

  const opponents = _.reject(players, {id: me.id});

  const playersBeforeMe = _.filter(
    opponents,
    player => player.point >= me.point
  ).length;

  const bestOpponentScore = _.max(_.map(opponents, 'point'));

  // The robot should not bother other players from reaching the podium
  const isRobotTooStrongInBigGame = (allPlayers >= 4 && playersBeforeMe < 3);
  const isRobotTooStrongInSmallGame = (allPlayers < 4 && (me.point > 1.5 * (bestOpponentScore || 40)));

  if (isRobotTooStrongInBigGame || isRobotTooStrongInSmallGame) {
    return MODE.IDLE;
  }

  if (playersBeforeMe / allPlayers > 0.2) {
    return MODE.PERFECT;
  }

  return MODE.NORMAL;
}

function answer(ctx) {
  const elapsedTime = new Date() - ctx.songStartTime;
  const targetWait = (
    Math.random()
    * (RESPONSE_TIME_LIMIT - WAITING_TIME_THRESHOLD)
  )
    + WAITING_TIME_THRESHOLD;
  const actualWait = targetWait > elapsedTime ? targetWait - elapsedTime : 0;

  console.log('wait till answer', actualWait, ' ms');

  setTimeout(() => {
    switch (ctx.behaviour) {
    case MODE.PERFECT:
      return perfect(ctx);
    case MODE.NORMAL:
      return laborious(ctx);
    case MODE.IDLE:
    default:
      return _.noop();
    }
  }, actualWait);
}

function createSend(socket) {
  return (response) => {
    if (config.answer) {
      console.log('send to server:', response);
      socket.emit('game-server-song-response-ask', {
        gameId: 'facile',
        response
      });
    } else {
      console.log('dry run send response');
    }
  };
}

module.exports = RoundManager;
