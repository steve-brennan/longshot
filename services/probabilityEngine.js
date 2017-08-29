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
        determineWeighting,
        createProbableNumberSet,
        ], function (err, result) {
            console.log('Final Function');
            //console.log(result);       
    });
};

function createProbableNumberSet(game, weightingMap) {
    console.log('In cPNS ');

    let averageDrawOccurence = 0;
    let averageProvisionalWeighting = 0;
    Draw.count({game:game}, (err, count) => {
        console.log('total draws ' + count);
    });

    
    let pns = new ProbableNumberSet({
        game: game,
        from_date : new Date(),
        to_date: new Date(),
        current_set: true,
        set_of_numbers : [], //Array.from(weightingMap.values()),
    });

    let sortedProbableNumberSetProvisional = Array.from(weightingMap.values()).sort((a,b) => {
        return a.provisional_weighting - b.provisional_weighting;
    });

    let totalWeighting = sortedProbableNumberSetProvisional.reduce((acc, cur) => {
        return acc + cur.weighting;
    }, 0);
    averageDrawOccurence = Math.round(totalWeighting/game.set_of_numbers[game.set_of_numbers.length -1].value)
    console.log('Avg ' + averageDrawOccurence);

    let totalProvisionalWeighting = sortedProbableNumberSetProvisional.reduce((acc, cur) =>{
        return acc + cur.provisional_weighting;
    }, 0);
    console.log('total prov w ' + totalProvisionalWeighting);
    averageProvisionalWeighting = Math.round(totalProvisionalWeighting/game.set_of_numbers[game.set_of_numbers.length -1].value)
    console.log('Avg prov ' + averageProvisionalWeighting);

    let pivot = sortedProbableNumberSetProvisional[0];
    let candidates = pivot.conditional_weighting.sort((a,b) => {
        return a.weighting - b.weighting;
    });
    console.log('Pivot ' + pivot.value );

    for(let i = 0; i< candidates.length; i++) {
        if(candidates[i].with_value.length < 3) {
            console.log('candidate ' + candidates[i].with_value + ' weighting ' + candidates[i].weighting);
        }
    }

        sortedProbableNumberSetProvisional.forEach((val) =>{
            console.log('Value ' + val.value + ' weight ' + val.weighting + ' provisional weighting ' + val.provisional_weighting);
        });

    


}


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

function determineWeighting(game, callback) {

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