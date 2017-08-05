'use strict'

var fs = require('fs');
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var csvparser = require('csv-parser');
var config = require('../config/config.json');

// Returns historical data for a given game.
exports.getGameData = function() {

    results =  getRemoteGameData();

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

exports.parseGameData = function () {
    //TODO: remove. draw and drawHistory object literals exist for dev purposes
    var draw = {
        drawNumber: Number,
        drawDate: Date,
        winningNumbers: [],
        division: Number
    };
    var drawHistory = {
        draws: []
    };
        
    fs.readFile(__dirname + config.service.gamedata.testDataSmallTattslotto.endpoint, function(err, data) {
        if(err) throw err;
        var drawHistoryArray = data.toString().split("\n");
        for( let i = 1; i < drawHistoryArray.length; i++) {

            var drawRecordArray = drawHistoryArray[i].toString().split(",");

            drawHistory.draws.push({
                drawNumber: drawRecordArray[0],
                drawDate: drawRecordArray[1],
                winningNumbers: [drawRecordArray[2]
                                ,drawRecordArray[3]
                                ,drawRecordArray[4]
                                ,drawRecordArray[5]
                                ,drawRecordArray[6]
                                ,drawRecordArray[7]
                                ,drawRecordArray[8]
                                ,drawRecordArray[9]],
                division: drawRecordArray.length > 10 ? drawRecordArray[10] : ''
            });
        }
    });

};

function modelLab() {

       
}

this.parseGameData();


