// reference to watch for squenceChanges, meaning the start of a new round.
var squenceRef = new Firebase("https://gjam2016.firebaseio.com/sequence");

squenceRef.on('value', function (dataSnapshot) {
    // code to handle new value.
});

// reference to watch for rain position change to update the rain position.
var rainRef = new Firebase("https://gjam2016.firebaseio.com/rain");

rainRef.on('value', function (dataSnapshot) {
    // code to handle new value.
});

// reference to players to read other player changes and update own player.
var playersRef = new Firebase("https://gjam2016.firebaseio.com/players");

playersRef.on('child_added', function (childSnapshot, prevChildKey) {
    // code to handle new player joining.
});

playersRef.on('child_removed', function (oldChildSnapshot) {
    // code to handle player leaving.
});

playersRef.on('child_changed', function (childSnapshot, prevChildKey) {
    // code to display changes to players.
});

// function to generate the randomized player keypads base off the current sequence.
function randomizeOptions() {

}

// function to handle incoming keypad strokes to test against the current sequence.
function keyStroke(strokeId) {

}

// function to update the client time stamp if a sequence was correctly entered.
function strokeSucceed() {

}