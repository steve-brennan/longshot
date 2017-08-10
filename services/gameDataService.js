'use strict'

var fs = require('fs');
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var Draw = require('../models/draw');
var Game = require('../models/game');

var config = require('../config/config.json');

// Returns historical data for a given game.
exports.getGameData = function(callback) {

    generateLocalGameData();
    
};

exports.generateLocalGameData = function (gameName, week, callback) {

    var drawFile = __dirname + '/../tests/' + 'testGameWeek' + week + '.csv';
    
    fs.readFile(drawFile, (err, data) =>{
        if(err) {callback(err);}
        this.storeGameData(gameName, data, callback);
    });
    
};

exports.storeGameData = function(gameName, data, callback) {

        var draws = [];
        var drawHistoryArray = data.toString().split("\n");

        Game.findOne({name: 'SimLotto'})
        .exec(function (err, game) {
            if (err) {console.log(err);}
    
            for( let i = 1; i < drawHistoryArray.length; i++) {

                var drawRecordArray = drawHistoryArray[i].toString().split(",");
                Draw.findOne({draw_number: drawRecordArray[0]})
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
                                            ,drawRecordArray[7]],
                            supplementary_numbers: [drawRecordArray[8]
                                                    ,drawRecordArray[9]],
                            division: drawRecordArray.length > 10 ? drawRecordArray[10] : ''
                        });

                        Draw.create(draws, (err, storedDraws) => {
                            if(err) {callback(err);}
                        });
                    }
                });
            }
            callback();
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