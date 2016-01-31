// reference to watch for sequenceChanges, meaning the start of a new round.
var sequenceRef = new Firebase("https://gjam2016.firebaseio.com/seq");

// reference to watch for rain position change to update the rain position.
var rainRef = new Firebase("https://gjam2016.firebaseio.com/rain");

// reference to players to read other player changes and update own player.
var playersRef = new Firebase("https://gjam2016.firebaseio.com/players");

var mePlayerRef = {};
var currentPlayerKey = -1;

// when value comes for players
playersRef.on("value", function (snapshot) {
    updatePlayers(snapshot);
})

// function to update game players
function updatePlayers(snapshot) {
    var checkIndex = 0;
    mePlayerRef = snapshot.val()[checkIndex];
    while (mePlayerRef.name !== undefined) {
        checkIndex++;
        if (checkIndex >= snapshot.val().length) {
            break;
        }
        mePlayerRef = snapshot.val()[checkIndex];
    }

    if (mePlayerRef.name !== undefined) {
        document.getElementById("infoDisplay").innerHTML = "Game Full! game stat: " + playersRef.val();
        currentPlayerKey = -1;
        return;
    }

    currentPlayerKey = checkIndex;
}

// function to add new player
function addPlayer() {
    var playerTag = document.getElementById("playerTag").value;
    playersRef.child(currentPlayerKey).update({
        name: playerTag
    });
    updatePlayers = function () {};
    location.href = '/remote/client.html?player=' + (currentPlayerKey-1);
}