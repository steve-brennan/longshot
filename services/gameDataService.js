'use strict'

var fs = require('fs');
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var config = require('../config/config.json');

// Returns historical data for a given game.
exports.getGameData = function() {

    results =  getRemoteGameData();

};

//TODO: Either wire to a cron job or set to get at appload based on time last called
// Retrieves data from a server
exports.getRemoteGameData = function (callback) {

    rp(config.service.gamedata.tattslotto.endpoint)
        .then((data) => {
            console.log(data); //TODO: remove
            callback(data);
        })
        .catch((err) => {
            console.log(err); //TODO: handle error
        });

};

