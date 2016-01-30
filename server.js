var express = require('express');
var app = express();
var util = require('util');

app.use(express.static('public'));


app.listen(3000, function () {
  console.log('Listing on port 3000');
});
