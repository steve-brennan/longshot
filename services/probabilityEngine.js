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
        determineBaseWeighting,
        determinePairWeighting,
        //myLastFunction,
        ], function (err, result) {
            console.log('Final Function');
            console.log(result)
        
    });
};

function determineBaseWeighting(game, callback) {

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
            callback(null, game, baseWeightingMap);
        });   
};

function determinePairWeighting(game, baseWeightingMap) {

    var pairWeightingMap = setPairWeightingMap(game.set_of_numbers);

    for(var key of pairWeightingMap.keys()) {
        console.log(key);
    }

}

function setPairWeightingMap(setOfNumbers) {
    console.log('in pair weighting');
    var pairWeightingMap = new Map();

    for(let x = 0; x< setOfNumbers.length; x++) {
        let numberX = setOfNumbers[x].value.length < 2 ? '0' + setOfNumbers[x].value : setOfNumbers[x].value;
        for(let y = 0; y < setOfNumbers.length; y++) {
            if(x !== y) {
                let numberY = setOfNumbers[x].value.length < 2 ? '0' + setOfNumbers[x].value : setOfNumbers[x].value;
                let numberKeyFirstHalf = numberX.toString() + numberY.toString();
                let numberKeySecondHalf = numberKeyFirstHalf.split('').reverse().join('');
                let numberKey = numberKeyFirstHalf.toString() + numberKeySecondHalf.toString();
                pairWeightingMap.set(numberKey, 0);
            }
        }
    }

    return pairWeightingMap;
}

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
