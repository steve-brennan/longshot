var async = require('async');
var gamedata = require('../services/gameDataService');
var Draw = require('../models/draw');
var Game = require('../models/game');
var ProbableNumberSet = require('../models/probablenumberset');
var probabilityEngine = require('../services/probabilityEngine');

exports.index = function(req, res) {

    Game.findOne({name: 'SimLotto'})
        .exec(function (err, game) {
            if (err) {console.log(err);}
            res.render('simulator_details',{activity: 'Simulator ready.', game: game});
        });

   
};

exports.draw = function(req, res) {

    gamedata.generateGameData(req.body.gameName, req.body.week, (err) => {

        if(err) {console.log(err);}
        res.json('Success');
    });
};

exports.deleteDraws = function(req, res) {
    
    Draw.remove({}, function(err){
        if(err) {console.log(err);}
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

exports.getProbableNumberSet = function(req, res) {

     Game.findOne({name: req.query.gameName})
        .exec((err, game) => {
            ProbableNumberSet.findOne({game: game, current_set: true})
                .exec((err, probableNumberSet) => {
                    res.json(probableNumberSet);
                });
        });
}

exports.calculate = function(req, res) {

    probabilityEngine.calculateProbableNumberSet(req.body.gameName, () => {
        res.json('success');
    });
}

exports.deleteProbableNumberSet = function(req, res) {
    
    ProbableNumberSet.remove({}, function(err){
        if(err) {console.log(err);}
        res.send('removed');
    });
};