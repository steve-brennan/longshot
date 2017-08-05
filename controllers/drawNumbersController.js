var async = require('async');
var gamedata = require('../services/gameDataService');

exports.index = function(req, res) {

    //TODO: Remove. Example only used for dev
    // gamedata.getRemoteGameData((results)=>{
    //     res.render('index',{data: results});
    // });

    res.render('index',{data: gamedata.parseGameData()});
};