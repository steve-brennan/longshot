'use strict'

/**
 * This model repsresnt a game and the set of all numbers used. There is only 1 document per game.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

var GameSchema = Schema({
    name: {type: String, unique: true},
    first_draw_date: {type: Date},
    latest_draw_date: {type: Date},
    set_of_numbers: [{
        value: {type: String, 
                set: v => padNumber(v)},
        times_drawn: {type: Number}
    }]
});

function padNumber(number) {
    return number.toString().length < 2 ? '0' + number.toString() : number;
}

module.exports = mongoose.model('Game', GameSchema);
