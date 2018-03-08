const program = require('commander');

const util = require('util');

const setTimeoutPromise = util.promisify(setTimeout);

const db = require('../db.js');
const initApp = require('../app.js');

program
  .version('0.1.0')
  .option('-d, --duration <n>', 'the duration of connexion to the game', parseInt)
  .parse(process.argv);


const MAX_INITIAL_WAIT = 6000;
const TIMEOUT = program.duration || 60000 * 20;

const initialWait = Math.random() * MAX_INITIAL_WAIT;
const actualTimeout = ((Math.random() / 2) + 1) * TIMEOUT;
console.log('Robot will start within', Math.floor(initialWait / 60000), 'minutes');

setTimeoutPromise(initialWait)
  .then(() => db.connect())
  .then(initApp)
  .then((disconnect) => {
    console.log('Launched, will shut down within', Math.floor(actualTimeout / 60000), 'minutes');

    return setTimeoutPromise(actualTimeout)
      .then(disconnect);
  })
  .then(() => {
    console.log('Ended robot on', new Date());
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
