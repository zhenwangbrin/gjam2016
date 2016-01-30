var express = require('express');
var app = express();
var util = require('util');
var _ = require('lodash');

app.use(express.static('public'));
app.listen(3000, function () {});


/***************************
*
***************************/
var fireRef = require('./server/Firebase')();

fireRef.on('child_changed', function(childSnapshot) {
  fireRef.once('value', function(snap){
    var game = snap.val();
    if(Date.now() > game.checkTime){
      var finishers = getFinishers(game);
      if(finishers.length === 0) return;
      var winner = getWinner(finishers);
      awardWinner(winner);
      game = newRound(game, 5);
      fireRef.set(game);
    }
  });
});

function newRound(game, seqCount){
  game.seq = newSeq(seqCount);
  game.checkTime = Date.now() + 5000;
  game.players = resetUsers(game.players);
  return game;
}

function newSeq(seqCount){
  var seq = [];
  for(var i = 0; i < seqCount; i++){
    seq.push(_.random(0, 6))
  }
  return seq;
}

function resetUsers(players){
  _.forEach(players, function(player){
    player.completed = false;
  })
  return players;
}

function getWinner(finishers){
  finishers = _.sortBy(finishers, ['completed']);
  return finishers[0]
}

function getFinishers(game){
  var finishers = [];
  _.forEach(game.players, function(player){
    if (player.completed){
      finishers.push(player);
    }
  });
  return finishers;
}

function awardWinner(winner){
  winner.score += 10;
}
