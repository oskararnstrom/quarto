if (Meteor.isServer) {
  Meteor.startup(function () {
    setupNewBoard();
    Messages.remove({});
    // code to run on server at startup
  });

  Meteor.methods({
    selectNext: function(pieceId, player){
      if(findNextPiece() == undefined){
        Pieces.update({_id: pieceId}, {$set: {position: 'next'}});
        printSystemMessage(player, 'Selected a piece.');
        return true;
      }
      return false;
    },
    setPiece: function(position, player){
      next = findNextPiece();
      ret = { status: false, win: false }
      if (next !== undefined){
        Pieces.update({_id: next._id}, {$set: {next: false, position: position}});
        printSystemMessage(player, 'Placed a piece.');
        ret.status = true;
        if (didAnyoneWin(position)){
          ret.win = true;
          win(player);
        }
      }
      return ret;
    },
    newGame: function() {
      setupNewBoard();
    }
  });

  printSystemMessage = function(player, message){
    var message = new Message(null, player, message, Date.now(), true);
    message.save();
  }

  findNextPiece = function() {
    return Pieces.findOne({ position: "next" })
  }

  setupNewBoard = function() {
    Pieces.remove({});
    for(i = 0; i < 16; i++){
      var piece = new Piece(null, i, null);
      piece.save();
    }
  }
  function win(player) {
    printSystemMessage(player, 'Won!!!!');
  }

  function didAnyoneWin(i){
    var groups = getGroups(i);
    var l = groups.length;
    for (i = 0; i < l; i++){
      var group = groups[i];
      var pieces = Pieces.find({position: {$in: group}}).fetch();
      if(pieces.length == 4){
        var win = 15;
        var win_reverse = 15;
        for (j = 0; j < 4; j++){
          win = win&pieces[j].key;
          win_reverse = win_reverse&(15-pieces[j].key) 
        }
        if (win || win_reverse){
          for (j = 0; j < 4; j++){
            Pieces.update({ _id: pieces[j]._id }, { $set: { winning_group: true } });    
          }
          return true;
        }
      }
    }
    return false;
  } 
}