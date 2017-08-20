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
      winning_numbers: [{type: String, set: v => padNumber(v)}],
      division: String,
  }
);

function padNumber(number) {
  return number.toString().length < 2 ? '0' + number.toString() : number;
}

//Export model
module.exports = mongoose.model('Draw', DrawSchema);