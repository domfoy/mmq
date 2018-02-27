// const config = require('config');

const db = require('../db.js');
const initApp = require('../app.js');

db.connect()
  .then(initApp)
  .then(() => {
    console.log('Launched');
  })
  .catch((err) => {
    console.error(err);
  });
