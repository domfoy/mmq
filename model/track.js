const mongoose = require('mongoose');

module.exports = register;

function register() {
  const trackSchema = new mongoose.Schema(schema);

  trackSchema.index({title: 1, artist: 1});
  mongoose.model('Track', trackSchema);
}

const schema = {
  title: String,
  artist: String,
  link: String,
  cover: String,
  filePath: String,
  createdAt: Date,
  updatedAt: Date,
  file: {}
};

