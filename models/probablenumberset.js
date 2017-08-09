'use strict'

/**
 * This model repsresnt the probable numbers for a given draw and associated weighting and reasoning. Historical sets are maintained for analytics.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ProbableNumberSetSchema = Schema({
    game: { type: Schema.ObjectId, ref: 'Game', required: true },
    from_date: {type: Date},
    to_date: {type: Date},
    current_set: {type: Boolean},
    set_of_numbers: [{
        value: {type: String},
        weighting: {type: Number},
    }],
});

//Export model
module.exports = mongoose.model('ProbableNumberSet', ProbableNumberSetSchema);