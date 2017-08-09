var async = require('async');
var gamedata = require('../services/gameDataService');
var Draw = require('../models/draw');
var Game = require('../models/game');

exports.index = function(req, res) {

    //TODO: Remove. Example only used for dev
    // gamedata.getRemoteGameData((results)=>{
    //     res.render('index',{data: results});
    // });

    console.log("In sim controller index");

    res.render('simulator_details',{activity: 'Simulator ready.'});
};

exports.create = function(req, res) {

    console.log("In simulator post");

    res.render('simulator_details',{activity: 'Simulator ready.'});
};

exports.display = function(req, res) {

    Game.find()
    .exec(function (err, game_list) {
      if (err) { return console.log(err); } //TODO: next to error
      //Successful, so render
      res.render('index', { activity: 'Game List', data: game_list });
    });
};

exports.delete = function(req, res) {

    Draw.remove({}, function(err){
        res.render('index', {activity: 'Cleared data', data: 'Empty'});
    });
};