'use strict'
/**
 * This model represents an individual draw from a game.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DrawSchema = Schema(
  {
      game: { type: Schema.ObjectId, ref: 'Game', required: true },
      draw_number: {type: String},
      draw_date: {type: Date},
      winning_numbers: [String],
      division: String,
  }
);

//Export model
module.exports = mongoose.model('Draw', DrawSchema);