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

    var drawFile = __dirname + '/../tests/' + 'testGameWeek' + week + '.csv';
    
    fs.readFile(drawFile, (err, data) =>{
        console.log('about to read file');
        if(err) {
            callback(err);
        }
        callback(null, data);
    });
    
};

//Stores game data from parsed file. Avoiding duplication by only storing draws which do not already exits.
exports.storeGameData = function(game, data, callback) {

        var draws = [];
        var drawHistoryArray = data.toString().split("\n");

        for( let i = 1; i < drawHistoryArray.length; i++) {
            var drawRecordArray = drawHistoryArray[i].toString().split(",");
            Draw.findOne({game: game, draw_number: drawRecordArray[0]})
                .exec(function (err, existingDraw){
                    if(!existingDraw) {
                        draws.push({
                            game: game,
                            draw_number: drawRecordArray[0],
                            draw_date: drawRecordArray[1],
                            winning_numbers: [drawRecordArray[2]
                                            ,drawRecordArray[3]
                                            ,drawRecordArray[4]
                                            ,drawRecordArray[5]
                                            ,drawRecordArray[6]
                                            ,drawRecordArray[7]
                                            ,drawRecordArray[8]
                                            ,drawRecordArray[9]]
                            ,division: drawRecordArray.length > 10 ? drawRecordArray[10] : ''
                        });

                        Draw.create(draws, (err, storedDraws) => {
                            if(err) {callback(err);}
                        });
                    }
                });
            }
            callback(); //Render
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