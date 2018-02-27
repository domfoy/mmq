const mongoose = require('mongoose');

module.exports = register;

const statSchema = {
  avg: Number,
  median: Number,
  last: Number,
  podium: [Number]
};

const schema = {
  timestamp: Date,
  playerCount: Number,
  title: statSchema,
  artist: statSchema
};

function register() {
  const roundSchema = new mongoose.Schema(schema);

  mongoose.model('Round', roundSchema);
}

