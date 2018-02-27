const mongoose = require('mongoose');

require('./round')();
require('./track')();

module.exports = {
  Round: mongoose.model('Round'),
  Track: mongoose.model('Track')
};
