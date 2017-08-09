'use strict'

/**
 * This file creates the initial database on startup. Set to only create these items if they do not exist.
 */
//TODO: Consider mdecoupling the execution from app startup
let async = require('async');
let Game = require('./models/game');

//Create and persist a game doc
function gameCreate(name, setOfNumbers, cb) {

  var gamedetails = {name:name , set_of_numbers: setOfNumbers};
  var query = {name:name};
  
  Game.findOneAndUpdate(query, gamedetails, {upsert: true, setDefaultsOnInsert: true}, (err, doc) => {
      if(err) {
          cb(err, null);
          return;
      }
      //console.log('New game: ' + doc);
      cb(null, doc)
  });
}

// Executes creating all game models with initial values
//TODO: Config this
function createGames(cb) {
    async.parallel([
        function(callback) {
            gameCreate('TattsLotto', generateNumberSet(1, 45), callback);
        },
        function(callback) {
            gameCreate('SimLotto', generateNumberSet(1, 45), callback);
        },
        ],
        // optional callback
        cb);
}

//Generates the number set for a draw from start to end (e.g 1..45)
function generateNumberSet(start, end) {
    var numberSet = [];
    for(let i = start; i < end +1; i++) {
        numberSet.push({value: i});
    }
    return numberSet;
}

//Function kickoff DB initialization. Called from App.js on start.
exports.populateDB = function() {
    async.series([
        createGames,
    ],
    // optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            //console.log('Results: '+results);
            
        }
    });
}