
var playerSequence = [];
var serverSequence = [];
var enteredSequence = [];
var clientPlayerRef = new Firebase("https://gjam2016.firebaseio.com/players/"+getParameterByName('player'));

if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    }
}

clientPlayerRef.on('value', function (dataSnapshot) {
    // code to handle disconnect
    clientPlayerRef.onDisconnect().update({name:null});
});

sequenceRef.on('value', function (dataSnapshot) {
    // code to handle new value.
    document.getElementById("enteredSequence").innerHTML = "";
    randomizeOptions(dataSnapshot.val());
});

rainRef.on('value', function (dataSnapshot) {

});

playersRef.on('child_added', function (childSnapshot, prevChildKey) {
    // code to handle new player joining.
});

playersRef.on('child_removed', function (oldChildSnapshot) {
    // code to handle player leaving.
});

playersRef.on('child_changed', function (childSnapshot, prevChildKey) {
    // code to display changes to players.
});

//function to randomize array
function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

// function to generate the randomized player keypads base off the current sequence.
function randomizeOptions(seq) {
    serverSequence = seq;
    playerSequence = serverSequence.slice(0);
    playerSequence.push(Math.floor(Math.random() * serverSequence.length));
    playerSequence = shuffle(playerSequence);
    
    for (var index = 0; index < playerSequence.length; index++) {
        var currentElem = document.getElementById('key'+index);
        currentElem.innerHTML = playerSequence[index];
    }
}

// function to handle incoming keypad strokes to test against the current sequence.
function keyStroke(keyIndex) {
    var currentKey = enteredSequence.length
    if (playerSequence[keyIndex] === serverSequence[currentKey]) {
        enteredSequence.push(playerSequence[keyIndex]);
        document.getElementById("enteredSequence").innerHTML = enteredSequence.join(' ');
        checkKeyStroke();
    } else {
        enteredSequence = [];
        document.getElementById("enteredSequence").innerHTML = 'X';
    }
}

// function to update the client time stamp if a sequence was correctly entered.
function checkKeyStroke() {
    if (enteredSequence.length === serverSequence.length) {
        document.getElementById("enteredSequence").innerHTML = 'You got it!';
        clientPlayerRef.update({
            completed: true,
            finishTime: Date.now()
        });
    }
}

// function to parse out player id or index
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}