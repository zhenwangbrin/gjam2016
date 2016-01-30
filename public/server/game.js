Game = function() {
  this.firebaseRef = null;
  this.map = new Map();
  this.cloud = new Cloud();
  this.players = [1,2,3,4];
  this.hud = new HUD();
  this.firebase = null;
};
Game.prototype = {
  auth: function() {
    var FireURL = "gjam2016.firebaseio.com/";
    var ref = new Firebase(FireURL);
    ref.authWithCustomToken("3Bdk3eWhR6QLEbVxhPA37rN4FdCMEsdNA9jcgKAr", function(error, authData) {
      if (error) {
        console.log("Authentication Failed!", error);
      } else {
        console.log("Authenticated!");
        debugger;
       }
    });

    this.firebase = ref;
  },
  initialize: function() {
    this.auth();
    this.hud.build();
    this.cloud.setCloudMiddle();
  },
  start: function() {

  },
  restart: function() {

  },
  setCloudPosition: function( position ) {

  },
  setCloudMiddle: function() {

  },

  setCloudToPlayer: function( playerIndex ) {
    var position = this.map.getPositionForPlayer( playerIndex );

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
      var slot = new PlayerSlot(model);
      var slotEl = slot.build();

      this.dom.players.appendChild( slotEl );
      this.slots.push( slot );
    }

    this.el.appendChild( this.dom.players );
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

PlayerSlot = function( model ) {
  this.model = model;
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
    this.dom.name.innerHTML = "Player";
    this.dom.score.innerHTML = "Score: 0";
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
