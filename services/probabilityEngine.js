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
        determinePairCombinationWeighting,
        ], function (err, result) {
            console.log('Final Function');        
    });
};

function initProbableNumberSet(setOfNumbers) {

    let newProbableNumberSet = [];

    for(let i = 0; i < setOfNumbers.length; i++) {
        newProbableNumberSet.push({
            value: setOfNumbers[i].value,
            weighting: 0,
            provisional_weighting: 0,
            conditional_weighting: []
        });
    }

    return newProbableNumberSet;
}

function determinePairCombinationWeighting(game, callback) {

    let weightingMap = new setWeightingMap(game.set_of_numbers);

    Draw.find({game: game}).sort({draw_number: 'asc'})
        .exec((err, draw_list) => {
            for(let i = 0; i < draw_list.length; i++) {
                let winningNumbers = draw_list[i].winning_numbers.sort();
                for(let w = 0; w < winningNumbers.length; w++) {
                    if(!isNaN(winningNumbers[w])) {
                        let numberW = winningNumbers[w];
                        weightingMap.set(numberW, updateWeighting(weightingMap.get(numberW), +1, +1, null, null));
                        for(let x = w+1; x < winningNumbers.length; x++) {
                            if(!isNaN(winningNumbers[x])) {
                                let numberX = winningNumbers[x];
                                weightingMap.set(numberW, updateWeighting(weightingMap.get(numberW), 0, +1, numberX, +1));
                                weightingMap.set(numberX, updateWeighting(weightingMap.get(numberX), 0, +1, numberW, +1));
                                for(let y = x+1; y < winningNumbers.length; y++) {
                                    if(!isNaN(winningNumbers[y])) {
                                        let numberY = winningNumbers[y];
                                        for(let z = y+1; z < winningNumbers.length; z++) {
                                            if(!isNaN(winningNumbers[z])) {
                                                let numberZ = winningNumbers[z];
                                                weightingMap.set(numberW, updateWeighting(weightingMap.get(numberW), 
                                                0, 
                                                +3, 
                                                numberX.toString() + numberY.toString() + numberZ.toString(),
                                                +3));
                                                weightingMap.set(numberX, updateWeighting(weightingMap.get(numberX), 
                                                0, 
                                                +3, 
                                                numberW.toString() + numberY.toString() + numberZ.toString(),
                                                +3));
                                                weightingMap.set(numberY, updateWeighting(weightingMap.get(numberY), 
                                                0, 
                                                +3, 
                                                numberW.toString() + numberX.toString() + numberZ.toString(),
                                                +3));
                                                weightingMap.set(numberZ, updateWeighting(weightingMap.get(numberZ), 
                                                0, 
                                                +3, 
                                                numberW.toString() + numberX.toString() + numberY.toString(),
                                                +3));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for(var key of weightingMap.keys()) {
                if(weightingMap.get(key)) {
                    console.log('Key: ' + key + ' weight: ' + weightingMap.get(key).weighting + ' provisional ' + weightingMap.get(key).provisional_weighting + ' conditionals ' + weightingMap.get(key).conditional_weighting.length);
                }
            }

            // for(var key of weightingMap.keys()) {
            //     for(let i = 0; i < weightingMap.get(key).conditional_weighting.length; i++) {
            //         console.log('Number ' + key + ' with ' + weightingMap.get(key).conditional_weighting[i].with_value +
            //         ' add weight ' + weightingMap.get(key).conditional_weighting[i].weighting);
            //     }
            // }
            callback(null, game, weightingMap);
        });


}

function setWeightingMap(setOfNumbers) {
    
    let weightingMap = new Map();

    for(let i =0 ; i < setOfNumbers.length; i++) {
        weightingMap.set(setOfNumbers[i].value,{
            value: setOfNumbers[i].value,
            weighting: 0,
            provisional_weighting: 0,
            conditional_weighting: []
        });
    }
    return weightingMap;
}

function updateWeighting(previousWeighting, weightAdjust, provisionalWeightAdjust, withValue, withWeightAdjust ) {
    var conditionalWeighting = previousWeighting.conditional_weighting;
    if(withValue) {
        var conditionalWeightingIndex = previousWeighting.conditional_weighting.findIndex((v) => {
            return v.with_value == withValue;
        });
        if(conditionalWeightingIndex >= 0) {
            conditionalWeighting[conditionalWeightingIndex] = {
                with_value : conditionalWeighting[conditionalWeightingIndex].with_value = 
                            conditionalWeighting[conditionalWeightingIndex].with_value,
                weighting : conditionalWeighting[conditionalWeightingIndex].weighting = 
                            conditionalWeighting[conditionalWeightingIndex].weighting + withWeightAdjust
            };
        } else {
            conditionalWeighting.push({
                with_value: withValue,
                weighting : withWeightAdjust
            });
        }
    }

    var newWeighting = {
        value : previousWeighting.value,
        weighting : previousWeighting.weighting + weightAdjust,
        provisional_weighting : previousWeighting.provisional_weighting + provisionalWeightAdjust,
        conditional_weighting : conditionalWeighting

        };

    return newWeighting;
    
}

// 45! / 4!(45 -4)! = 148995 