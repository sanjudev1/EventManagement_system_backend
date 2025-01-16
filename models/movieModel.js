const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  plot: String,
  genres: [String],
  runtime: Number,
  rated: String,
  cast: [String],
  num_mflix_comments: Number,
  poster: String,
  fullplot: String,
  countries: [String],
  released: Date,
  directors: [String],
  writers: [String],
  awards: {
    wins: Number,
    nominations: Number,
    text: String
  },
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  },
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    production: String
  }
});

module.exports = mongoose.model('Movie', movieSchema);
