var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DrawSchema = Schema(
  {
      draw_number: {type: String},
      draw_date: {type: Date},
      winning_numbers: [String],
      supplementary_numbers: [String],
      division: String,
  }
);

//Export model
module.exports = mongoose.model('Draw', DrawSchema);