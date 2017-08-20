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
        // calculateProbableNumberSet - recieves maps fro all subsequent functions and calculates weighting
        //createProbableNumberSet
        ], function (err, result) {
            console.log('Final Function');
            //console.log(result)
        
    });
};

function determineBaseWeighting(game, callback) {

    var baseWeightingMap = setBaseWeightingMap(game.set_of_numbers);

    Draw.find({game: game})
        .exec((err, draw_list) => {
            for(let i = 0; i < draw_list.length; i++) {
                draw_list[i].winning_numbers.map((number) =>{
                    if(!isNaN(number)) {
                        baseWeightingMap.set(number, baseWeightingMap.get(number) +1);                      
                    }
                });
            }
            callback(null, game, baseWeightingMap);
        });   
};

function determinePairWeighting(game, baseWeightingMap, callback) {

    var pairWeightingMap = setPairWeightingMap(game.set_of_numbers);

    Draw.find({game: game})
        .exec((err, draw_list) => {
            for(let i = 0; i < draw_list.length; i++) {
                let winningNumbers = draw_list[i].winning_numbers.sort();
                for(let x = 0; x < winningNumbers.length; x++ ) {
                    if(!isNaN(winningNumbers[x])) {
                        let numberX = winningNumbers[x];    
                        for(let y = x+1; y < winningNumbers.length; y++) {
                            if(!isNaN(winningNumbers[y])) {
                                let numberY = winningNumbers[y];
                                let pairFisrtHalf = numberX.toString() + numberY.toString()
                                let pairSecondHalf = pairFisrtHalf.split('').reverse().join('');
                                let pairCombination = pairFisrtHalf.toString() + pairSecondHalf.toString();
                                pairWeightingMap.set(pairCombination, pairWeightingMap.get(pairCombination) +1);
                            }
                        }
                    }
                }
            }

            // for(var key of pairWeightingMap.keys()) {
                
            //     if(pairWeightingMap.get(key) > 0) {
            //         console.log(key + 'combo drawn ' + pairWeightingMap.get(key) + ' times');
            //     }
            // }
            console.log('Lenght of pwm ' + pairWeightingMap.size);
            callback(null, game, baseWeightingMap, pairWeightingMap);
        });

}

function setPairCombinationWeightingMap(setOfNumbers) {

    var pairCombinationWeightingMap = new Map();
}

function setPairWeightingMap(setOfNumbers) {
    
    var pairWeightingMap = new Map();

    for(let x = 0; x< setOfNumbers.length; x++) {
        let numberX = setOfNumbers[x].value;
        for(let y = x + 1; y < setOfNumbers.length; y++) {
            if(x !== y) {
                let numberY = setOfNumbers[y].value;
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
