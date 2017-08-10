var async = require('async');
var gamedata = require('../services/gameDataService');
var Draw = require('../models/draw');
var Game = require('../models/game');

exports.index = function(req, res) {

    Game.findOne({name: 'SimLotto'})
        .exec(function (err, game) {
            if (err) {console.log(err);}
            res.render('simulator_details',{activity: 'Simulator ready.', game: game});
        });

   
};

exports.create = function(req, res) {

    gamedata.generateLocalGameData(req.body.gameName, req.body.week, (err) => {
        
        console.log('In CREATE CALL BACK');
        if(err) {console.log(err);}
        res.json('Success');
    });
};

exports.deleteDraws = function(req, res) {
    
    Draw.remove({}, function(err){
        if(err) {console.log('ERROR***** '+ err);}
        res.send('removed');
    });
};

exports.drawList = function(req,res) {

    Draw.find()
        .exec(function (err, draw_list){
            if(err) {console.log(err);}
            res.json(draw_list);
        });
    
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