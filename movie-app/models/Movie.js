const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: String,
  releaseDate: Date,
  image: String,
  genre: String, 
  description: String,
  rating: Number,
  review: String,
  cast: String
});

module.exports = mongoose.model('Movie', movieSchema);
