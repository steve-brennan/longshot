let async = require('async');
let gamedata = require('../services/gameDataService');
let Draw = require('../models/draw');
let Game = require('../models/game');
let ProbableNumberSet = require('../models/probablenumberset');


exports.index = function(req, res) {

    //TODO: Remove. Example only used for dev
    // gamedata.getRemoteGameData((results)=>{
    //     res.render('index',{data: results});
    // });

    res.render('index',{activity: 'Here are the probable numbers.'});
};