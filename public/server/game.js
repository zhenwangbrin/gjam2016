Game = function() {
  this.firebaseRef = null;
  this.map = new Map();
  this.cloud = new Cloud();
  this.players = null;
  this.hud = new HUD();
  this.sequence = new Sequence();
  this.firebase = {};
};
Game.prototype = {
  initialize: function() {
    this.bindFirebase();
    this.cloud.setCloudMiddle();
  },
  updateScores: function( newPlayerValues ) {
    for(var idx = 0; idx < newPlayerValues.length; idx++ ){
      this.players[idx].score = newPlayerValues.score;
    }
  },
  bindFirebase: function() {
    this.firebase = {
      players: new Firebase("https://gjam2016.firebaseio.com/players"),
      rain: new Firebase("https://gjam2016.firebaseio.com/rain"),
      sequence: new Firebase("https://gjam2016.firebaseio.com/seq")
    };


    this.firebase.players.on("value", function( players ) {
      var newValue = players.val();
      if(!Game.players || Game.players.length !== newValue.length) {
        Game.players = newValue;
        Game.hud.build();
      } else {
        Game.updateScores( newValue );
        Game.hud.refresh();
      }

    });
    this.firebase.rain.on("value", function( rain ) {
      var target = rain.val();

      if( target && target > -1) {
        Game.cloud.setCloudToPlayer(target);
      } else {
        Game.cloud.setCloudMiddle();
      }
    });
    this.firebase.sequence.on("value", function( sequence ) {
      var newValue = sequence.val();
      Game.sequence.changeTo( newValue );
    });
  },
  start: function() {

  },
  restart: function() {

  },
  setCloudToPlayer: function( playerIndex ) {
    var position = this.map.getPositionForPlayer( playerIndex );

  }
};


Sequence = function() {
  this.el = document.querySelector("#sequence");
  this.pattern = null;
  this.hideTimeout = null;
};

Sequence.prototype = {
  changeTo: function( newValue ) {
    var sequence = this;

    this.pattern = newValue;
    this.refresh();

    if(this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    setTimeout( function() {
      this.hideTimeout = null;
      sequence.hidePart();
      sequence.scramble();
    }, 1000);
  },
  refresh: function( ) {
    this.el.innerHTML = this.pattern.join(" ");
  },
  scramble: function() {
    // Fisher-Yates scramble (http://stackoverflow.com/a/2450976)
    var currentIndex = this.pattern.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.pattern[currentIndex];
      this.pattern[currentIndex] = this.pattern[randomIndex];
      this.pattern[randomIndex] = temporaryValue;
    }
    this.refresh();
    return this.pattern;
  },
  hidePart: function() {
    var index = Math.random();
    index = Math.ceil(index * this.pattern.length,0) - 1;

    if(index < 0) {
      index = 0;
    }
    if(index >= this.pattern.length) {
      index = this.pattern.length - 1;
    }

    this.pattern[index] = "?";
    this.refresh();
  }
 };

//-------------------------------------------
// HUD
//-------------------------------------------
HUD = function() {
  this.el = document.querySelector("#hud");
  this.slots = [];
  this.dom = {
    players: null
  };
};

HUD.prototype = {
  build: function() {
    this.cleanupInner();

    this.dom.players = document.createElement("ul");
    this.dom.players.classList.add("players");

    var idx;
    for(idx = 0; idx < Game.players.length; idx++) {
      var model = Game.players[idx];
      var slot = new PlayerSlot(model, idx);
      var slotEl = slot.build();

      this.dom.players.appendChild( slotEl );
      this.slots.push( slot );
    }

    this.el.appendChild( this.dom.players );
  },
  refresh: function() {
    for(var idx = 0; idx < Game.players.length; idx++) {
      var slot = this.dom.players[idx];
      slot.refresh();
    }
  },
  cleanupInner: function() {
    if(this.dom.players) {
      for(idx = 0; idx < Game.players.length; idx++) {
        var slot = this.slots[idx];

        slot.cleanup();
        this.slots[idx] = null;
      }
    }

    this.dom.players = null;
  },
  cleanup: function() {
    this.cleanupInner();
    // Until this builds itself completely, cannot remove itself
    // this.el.parentNode.removeChild( this.el );
    // this.el = null;
  },
};

PlayerSlot = function( model, index ) {
  this.model = model;
  this.index = index;
  this.el = null;
  this.dom = {
    score: null,
    name: null
  };
};
PlayerSlot.prototype = {
  build: function() {
    this.cleanupInner();

    if(!this.el) {
      this.el = document.createElement("li");
      this.el.classList.add("player");
    }

    this.dom.name = document.createElement("span");
    this.dom.name.classList.add("name");
    this.el.appendChild( this.dom.name );

    this.dom.score = document.createElement("span");
    this.dom.score.classList.add("score");
    this.el.appendChild( this.dom.score );

    this.render();
    return this.el;
  },
  cleanupInner: function() {
    if(this.dom.score) {
      this.dom.score = null;
      this.dom.name = null;
      this.el.innerHTML = "";
    }
  },
  cleanup: function() {
    this.cleanupInner();
    this.el.parentNode.removeChild( this.el );
    this.el = null;
  },
  render: function() {
    this.dom.name.innerHTML = this.model.name || "Player " + (this.index + 1);
    this.dom.score.innerHTML = this.model.score;
  }
};





//-------------------------------------------
// Cloud
//-------------------------------------------
Cloud = function() {
  this.el = document.querySelector("#cloud");
};

Cloud.VERTICAL_OFFSET = 250;
Cloud.VERTICAL_OFFSET_RELATIVE = 0.25;

Cloud.prototype = {
  get position() {
    return {
      left: this.el.style.left,
      top: this.el.style.top
    };
  },
  set position( val ) {
    this.el.style.left = val.x;
    this.el.style.top = val.y;
  },
  get relativePosition() {
    throw "GET relativePosition not implemented yet";
  },
  set relativePosition( relativePos ) {
    this.position = {
      x: decToPercent( relativePos.h ),
      y: decToPercent( relativePos.v )
    };
  },
  getPositionAboveCoordinates: function( coordinates ) {
    return {
      x: coordinates.x,
      y: coordinates.y - Cloud.VERTICAL_OFFSET,
      relative: {
        h: coordinates.relative.h,
        v: coordinates.relative.v - Cloud.VERTICAL_OFFSET_RELATIVE
      }
    };
  },
  setCloudMiddle: function() {
    var position = Game.map.getPositionMapMiddle();
    position = this.getPositionAboveCoordinates( position );
    this.relativePosition = position.relative;
  },

  setCloudToPlayer: function( playerIndex ) {
    var position = Game.map.getPositionForPlayer( playerIndex );
    position = this.getPositionAboveCoordinates( position );
    this.relativePosition = position.relative;
  }
};




//-------------------------------------------
// Map
//-------------------------------------------
Map = function() {
  this.el = document.querySelector('#map');
};

Map.VERTICAL_OFFSET = 0;//200;
Map.VERTICAL_OFFSET_RELATIVE = 0;//0.2;

Map.prototype = {
  get width() {
    return this.el.offsetWidth;
  },
  get height() {
    return this.el.offsetHeight;
  },
  getPositionMapMiddle: function() {
    return this.conformCoordinates({
      x: 0.5 * this.width,
      y: 0.5 * this.height,
      relative: {
        v: 0.5,
        h: 0.5
      }
    });
  },
  getPositionForPlayer: function( playerIndex ) {
    var coordinates = { x: 0, y: 0 },
        relativePos = { v: 0, h: 0 };

    switch (playerIndex) {
      case 0:
        relativePos = { v: 0.20, h: 0.50 };
        break;
      case 1:
        relativePos = { v: 0.50, h: 0.80 };
        break;
      case 2:
        relativePos = { v: 0.80, h: 0.50 };
        break;
      case 3:
        relativePos = { v: 0.50, h: 0.20 };
        break;
    }

    coordinates = {
      x: relativePos.h * this.width,
      y: relativePos.v * this.height
    };

    return this.conformCoordinates({
      x: coordinates.x,
      y: coordinates.y,
      relative: relativePos
    });
  },

  conformCoordinates: function( coordinates ) {
    return {
      x: coordinates.x,
      y: Math.max(coordinates.y - Map.VERTICAL_OFFSET, 0),

      relative: {
        h: coordinates.relative.h,
        v: Math.max(coordinates.relative.v - Map.VERTICAL_OFFSET_RELATIVE, 0)
      }
    };
  }
};

decToPercent = function( val ) {
  return (val * 100) + "%";
};
