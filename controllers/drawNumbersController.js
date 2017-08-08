var async = require('async');
var gamedata = require('../services/gameDataService');
var Draw = require('../models/draw');

exports.index = function(req, res) {

    //TODO: Remove. Example only used for dev
    // gamedata.getRemoteGameData((results)=>{
    //     res.render('index',{data: results});
    // });

    res.render('index',{activity: 'Let\'s begin'});
};

exports.create = function(req, res) {

    gamedata.generateLocalGameData((err)=>{
        if(err){
            res.render('index', {activity: 'Generating data', data: 'An error occured ' + err});
        }
        res.render('index', {activity: 'Generating data',data: 'Success'});
    });

};

exports.display = function(req, res) {

    Draw.find()
    .exec(function (err, draw_list) {
      if (err) { return console.log(err); } //TODO: next to error
      //Successful, so render
      res.render('index', { activity: 'Draw List', data: draw_list });
    });
};

exports.delete = function(req, res) {
    Draw.remove({}, function(err){
        res.render('index', {activity: 'Cleared data', data: 'Empty'});
    });
};