'use strict'

const fs = require('fs');
const http = require('http');
const request = require('request');
const rp = require('request-promise');
const Draw = require('../models/draw');
const Game = require('../models/game');
const async = require('async');

const config = require('../config/config.json');

//Calls readLocalData and storeGameData to create draws in the database. This is used to simulate weekly draws.
exports.generateGameData = function(gameName, week, renderCallback) {
    async.series({
        fileData: (callback)=>{
            this.readLocalGameData(gameName, week, callback);
        },
        game: (callback) => {
            Game.findOne({name: gameName})
                .exec(function (err, game) { 
                    callback(null, game);
                });
        }
    }, (err, results)=>{

        this.storeGameData(results.game, results.fileData, renderCallback);
    });
    
};

//Reads local test game data from simulated csv files.
exports.readLocalGameData = function (gameName, week, callback) {
    var drawFile = __dirname + '/../tests/' + 'testGameData.csv'; //'testGameWeek' + week + '.csv';
    
    fs.readFile(drawFile, (err, data) =>{
        if(err) {
            callback(err);
        }
        callback(null, data);
    });
    
};

//Stores game data from parsed file. Avoiding duplication by only storing draws which do not already exits.
exports.storeGameData = function(game, data, callback) {
        var draws = [];
        var newDraws = [];
        var drawHistoryArray = data.toString().split("\n");
        drawHistoryArray.splice(0,1);

        drawHistoryArray.forEach((drawRecord) => {
            var drawRecordArray = drawRecord.toString().split(",");
            if(drawRecordArray[0] != "") {
                draws.push({
                    game: game,
                    draw_number: drawRecordArray[0].length < 4 ? '0' + drawRecordArray[0].replace(/"/g,'') 
                                                                : drawRecordArray[0].replace(/"/g,'')  ,
                    draw_date: drawRecordArray[1].replace(/"/g,''),
                    winning_numbers: [drawRecordArray[2].replace(/"/g,'')
                                    ,drawRecordArray[3].replace(/"/g,'')
                                    ,drawRecordArray[4].replace(/"/g,'')
                                    ,drawRecordArray[5].replace(/"/g,'')
                                    ,drawRecordArray[6].replace(/"/g,'')
                                    ,drawRecordArray[7].replace(/"/g,'')
                                    ,fixNumber(drawRecordArray[8])
                                    ,fixNumber(drawRecordArray[9])]
                    ,division: drawRecordArray.length > 10 ? drawRecordArray[10].replace(/"/g,'') : ''
                });
            }
        });
    

        draws.forEach((draw) =>{
            Draw.findOne({draw_number: draw.draw_number})
                .exec((err, existingDraw) => {
                    if(!existingDraw) {
                        Draw.create(draw, (err, newDraw)=>{
                            if(err){console.log(err)}
                            if(draws.indexOf(draw) == draws.length -1) {
                                callback();
                            }
                        });
                    };
                });
            
        });
};

/**TODO: Either wire to a cron job or set to get at appload based on time last called.Set to private. 
    Will need to be abstracted for variuos methods (e.g. API chunky)**/
// Retrieves data from a server
exports.getRemoteGameData = function (callback) {

    rp(config.service.gamedata.tattslotto.endpoint)
        .then((drawHistory) => {
            console.log(drawHistory); //TODO: remove
            callback(drawHistory); //TODO save to model
        })
        .catch((err) => {
            console.log(err); //TODO: handle error
        });
};

// For some reason the TattsLotto file vs a custom file, even with a cut and paste of the content, is flaky.
function fixNumber(number) {
    if(number == null || number == undefined) {
        return '0x'
    }

    var num = number != null ? number.toString().replace(/"/g,'').trim() : number.trim();

    if(num.toString().length < 2) {
        let val = '0' + num.toString();
        return val;
    }
    
    return num;
}