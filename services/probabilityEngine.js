'use strict'

const async = require('async');
const Draw = require('../models/draw');
const Game = require('../models/game');
const ProbableNumberSet = require('../models/probablenumberset');

// Conatins the core functionality to determine number weighting.

exports.calculateProbableNumberSet = function(gameName, callback) {

    async.waterfall([
        function(callback) {
            Game.findOne({name:gameName})
                .exec((err, game) => {
                    if(err) {console.log(err);}
                    callback(null, game);
                })
        },
        determineBaseWaiting,
        //mySecondFunction,
        //myLastFunction,
        ], function (err, result) {
            console.log('Final Function');
            console.log(result)
        
    });
};

function determineBaseWaiting(game, callback) {
    var numberSetCount = [];
    var baseWeightingMap = setBaseWeightingMap(game.set_of_numbers);

    Draw.find({game: game})
        .exec((err, draw_list) => {
            for(let i = 0; i < draw_list.length; i++) {
                draw_list[i].winning_numbers.map((number) =>{
                    if(!isNaN(number) ) {
                        baseWeightingMap.set(number, baseWeightingMap.get(number) +1);                      
                    }
                });
            }
            callback(null, baseWeightingMap);
        });   
};

function setBaseWeightingMap(setOfNumbers) {
    var baseWeightingMap = new Map();

    for(let i =0 ; i < setOfNumbers.length; i++) {
        baseWeightingMap.set(setOfNumbers[i].value, 0);
    }

    return baseWeightingMap;
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
