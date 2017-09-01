'use strict'

const async = require('async');
const Draw = require('../models/draw');
const Game = require('../models/game');
const ProbableNumberSet = require('../models/probablenumberset');

// Conatins the core functionality to determine number weighting.

exports.calculateProbableNumberSet = function(gameName, callback) {
    console.log('In PEcalcPNS');
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
            callback();   
    });
};

function createProbableNumberSet(game, weightingMap, callback) {

    let averageDrawOccurence = 0;
    let averageProvisionalWeighting = 0;

   
    let sortedProbableNumberSetProvisional = Array.from(weightingMap.values()).sort((a,b) => {
        return a.provisional_weighting - b.provisional_weighting;
    });

    let totalWeighting = sortedProbableNumberSetProvisional.reduce((acc, cur) => {
        return acc + cur.weighting;
    }, 0);
    averageDrawOccurence = Math.round(totalWeighting/game.set_of_numbers[game.set_of_numbers.length -1].value)

    let totalProvisionalWeighting = sortedProbableNumberSetProvisional.reduce((acc, cur) =>{
        return acc + cur.provisional_weighting;
    }, 0);
    averageProvisionalWeighting = Math.round(totalProvisionalWeighting/game.set_of_numbers[game.set_of_numbers.length -1].value)

    let setOfNumbers = Array.from(weightingMap.values()).map((num) => {
        let setNum = num;
        setNum.weighting = averageDrawOccurence - num.weighting;
        setNum.provisional_weighting = averageProvisionalWeighting - num.provisional_weighting;
        return setNum;
    });

    let pns = new ProbableNumberSet({
        game: game,
        from_date : new Date(),
        to_date: new Date(),
        current_set: true,
        set_of_numbers : setOfNumbers,
    });

    ProbableNumberSet.create(pns, function(err, newPNS){
        if(err) {console.log(err);}
        console.log('PNS created ' + newPNS.game.name);
        callback(null,newPNS);
    });


    setOfNumbers.sort((a,b) => {
        return b.provisional_weighting - a.provisional_weighting;
    });
    setOfNumbers.forEach((val) =>{
        console.log('Value ' + val.value + ' weight ' + val.weighting + ' provisional weighting ' + val.provisional_weighting + ' draws ' + (averageDrawOccurence - val.weighting  ));
        //console.log(val);
    });

    let luckyNumbers = [];
    luckyNumbers.push(setOfNumbers[0]);

    setOfNumbers[0].conditional_weighting.sort((a,b) => {
        return a.weighting - b.weighting;
    });

    setOfNumbers[0].conditional_weighting.forEach((conNum) => {
        console.log('with value ' + conNum.with_value + ' weighting ' + conNum.weighting);
    });
    let nextLuckyNumber = setOfNumbers.find((num) => {
        return num.value == luckyNumbers[0].conditional_weighting[0].with_value;
    });

    luckyNumbers.push(nextLuckyNumber);

    for(let i = 0; i< luckyNumbers.length; i++) {
        console.log('Lucky Number ' + i + ' is ' + luckyNumbers[i].value);
    }


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
    console.log('In PEdw');
    let weightingMap = new setWeightingMap(game.set_of_numbers);

    Draw.find({game: game}).sort({draw_number: 'asc'})
        .exec((err, draw_list) => {
            for(let i = 0; i < draw_list.length; i++) {
                let winningNumbers = draw_list[i].winning_numbers.sort();
                for(let w = 0; w < winningNumbers.length; w++) {
                    if(!isNaN(winningNumbers[w])) {
                        let numberW = winningNumbers[w];
                        //console.log('Adjusting base weight for ' + numberW);
                        weightingMap.set(numberW, updateWeighting(weightingMap.get(numberW), +1, 0, null, null));
                        for(let x = w+1; x < winningNumbers.length ; x++) {
                            if(!isNaN(winningNumbers[x]) && winningNumbers[x] != winningNumbers[w]) {
                                let numberX = winningNumbers[x];
                                //console.log('Infecting ' + numberW + ' with ' + numberX);
                                weightingMap.set(numberW, updateWeighting(weightingMap.get(numberW), 
                                                0, 
                                                +1, 
                                                numberX, 
                                                +1));
                                //console.log('Infecting ' + numberX + ' with ' + numberW);
                                weightingMap.set(numberX, updateWeighting(weightingMap.get(numberX),
                                                0, 
                                                +1, 
                                                numberW, 
                                                +1));
                                // for(let y = x+1; y < winningNumbers.length; y++) {
                                //     if(!isNaN(winningNumbers[y])) {
                                //         let numberY = winningNumbers[y];
                                //         for(let z = y+1; z < winningNumbers.length; z++) {
                                //             if(!isNaN(winningNumbers[z])) {
                                //                 let numberZ = winningNumbers[z];
                                //                 weightingMap.set(numberW, updateWeighting(weightingMap.get(numberW), 
                                //                 0, 
                                //                 +3, 
                                //                 numberX.toString() + numberY.toString() + numberZ.toString(),
                                //                 +3));
                                //                 weightingMap.set(numberX, updateWeighting(weightingMap.get(numberX), 
                                //                 0, 
                                //                 +3, 
                                //                 numberW.toString() + numberY.toString() + numberZ.toString(),
                                //                 +3));
                                //                 weightingMap.set(numberY, updateWeighting(weightingMap.get(numberY), 
                                //                 0, 
                                //                 +3, 
                                //                 numberW.toString() + numberX.toString() + numberZ.toString(),
                                //                 +3));
                                //                 weightingMap.set(numberZ, updateWeighting(weightingMap.get(numberZ), 
                                //                 0, 
                                //                 +3, 
                                //                 numberW.toString() + numberX.toString() + numberY.toString(),
                                //                 +3));
                                //             }
                                //         }
                                //     }
                                // }
                            }
                        }
                    }
                }
            }
            
            console.log('In PEdw calling back');
            for(let key of weightingMap.keys()) {
                for(let i = 0; i < weightingMap.get(key).conditional_weighting.length; i++) {
                    weightingMap.get(key).provisional_weighting += 
                        weightingMap.get(key).conditional_weighting[i].weighting *
                        weightingMap.get(weightingMap.get(key).conditional_weighting[i].with_value).weighting;
                }
            }

            // for(let key of weightingMap.keys()) {
            //     if(key == '44' || key == '99')
            //          weightingMap.get(key).conditional_weighting.forEach((cw)=>{
            //              //console.log('key ' + key );
            //              console.log('cw ' + cw.with_value + ' ' +cw.weighting);
            //          });
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