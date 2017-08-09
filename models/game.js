'use strict'

/**
 * This model repsresnt a game and the set of all numbers used. There is only 1 document per game.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

var GameSchema = Schema({
    name: {type: String, unique: true},
    total_draws: {type: Number},
    first_draw_date: {type: Date},
    latest_draw_date: {type: Date},
    set_of_numbers: [{
        value: {type: String},
        times_drawn: {type: Number}
    }],
});

module.exports = mongoose.model('Game', GameSchema);
