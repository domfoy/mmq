/* eslint-disable no-await-in-loop */
const util = require('util');

const _ = require('lodash');

const {polio} = require('./string-alteration');

const TIMEOUT = 2000;
const setTimeoutPromise = util.promisify(setTimeout);

module.exports = {
  perfect,
  laborious
};

function perfect(ctx) {
  ctx.send(displayResponse(ctx.guessedTrack, {
    title: true,
    artist: true
  }));
}

async function laborious(ctx, {
  maxTry = 4,
  delay: {
    min: minDelay = 1000,
    max: maxDelay = 4000
  } = {},
  fullProb = 0.9
} = {}) {
  let successfulTitle = false;
  let successfulArtist = false;
  for (let attempt = 1; attempt <= maxTry && !(successfulTitle && successfulArtist); attempt++) {
    const expectedDelay = (Math.random() * (maxDelay - minDelay)) + minDelay;
    const mispellProb = (0.05 * Math.exp(-((attempt - 1) / (maxTry)))) + 0.01;
    const responseComponents = setFieldsToGuess(successfulTitle, successfulArtist, fullProb);


    const sendDate = new Date();
    ctx.send(polio(displayResponse(ctx.guessedTrack, responseComponents), {p1: mispellProb}));

    const serverResponse = await new Promise((resolve, reject) => {
      ctx.socket.once('game-server-song-response-result', resolve);

      setTimeout(() => {
        reject(new Error('No server response'));
      }, TIMEOUT);
    });
    console.log(`delay: ${expectedDelay} ms : ${JSON.stringify(responseComponents)}, response: ${JSON.stringify(serverResponse.result)}`);

    if (_.get(serverResponse, 'result.field_one')) {
      successfulTitle = true;
    }
    if (_.get(serverResponse, 'result.field_two')) {
      successfulArtist = true;
    }

    const elapsed = new Date() - sendDate;
    const delay = expectedDelay > elapsed ? expectedDelay - elapsed : 0;
    await setTimeoutPromise(delay);
  }

  if (successfulTitle && successfulArtist) {
    return;
  }

  const responseComponents = Object.assign(
    {},
    !successfulArtist && {artist: true},
    !successfulTitle && {title: true},
  );

  ctx.send(displayResponse(ctx.guessedTrack, responseComponents));
}

function setFieldsToGuess(successfulTitle, successfulArtist, fullProb) {
  let responseComponents = {};

  if (successfulTitle) {
    responseComponents = {artist: true};
  } else if (successfulArtist) {
    responseComponents = {title: true};
  } else {
    responseComponents = Math.random() <= 0.5 ? {title: true} : {artist: true};
    const tryFullResponse = Math.random() < fullProb;

    if (tryFullResponse) {
      responseComponents = {
        artist: true,
        title: true
      };
    }
  }

  return responseComponents;
}

function displayResponse(track, options) {
  let response = [];

  if (options.title) {
    response.push(track.title);
  }
  if (options.artist) {
    response.push(track.artist);
  }

  response = replaceResponse(_.join(response, ' '));
  response = _.lowerCase(_.deburr(response));

  return response;
}

function replaceResponse(response) {
  const latinCharsOnly = _.replace(response, /("|'|\(|\[|_|\)|\]|,|\?|;|\.|:|\/|!|%)/g, '');
  const noDollar = _.replace(latinCharsOnly, /\$/g, 's');
  const noAmpersand = _.replace(noDollar, /&/g, ' et ');

  return noAmpersand;
}
