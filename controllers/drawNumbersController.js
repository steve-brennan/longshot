var async = require('async');
var gamedata = require('../services/gameDataService');

exports.index = function(req, res) {

    //res.render('index',{data: 'Hello this is data'});
    gamedata.getRemoteGameData((results)=>{
        res.render('index',{data: results});
    });
};