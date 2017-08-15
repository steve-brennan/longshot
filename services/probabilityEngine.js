'use strict'
const Draw = require('../models/draw');
const Game = require('../models/game');
const ProbableNumberSet = require('../models/probablenumberset');

// Conatins the core functionality to determine number weighting.

exports.calculateProbableNumberSet = function(gameName, callback) {

    Game.findOne({name: gameName})
        .exec((err, game) => {
            if(err){cosnole.log(err);}
            calculate(game);
        });
    callback();
};

function calculate(game) {

    Draw.find({game: game})
        .exec((err, draw_list) => {
            var winningNumbers = createValueSet(draw_list[0].winning_numbers);
            ProbableNumberSet.create({
                game: game,
                from_date: '20170815',
                to_date: '20170822',
                current_set: true,
                set_of_numbers: winningNumbers
            }, (err,pns) => {
                if(err){console.log('PNS ERROR ' + err);}
            });
        });
};

function createValueSet(arrayOfNumbers) {

    var result = [];
    var weight = 8;
    result = arrayOfNumbers.map((num) => {
        if(num) {
            return {value: num, weighting:weight}
            weight += 1;
        }
    });
    return result;

};