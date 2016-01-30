var Firebase = require("firebase");
var FireURL = "gjam2016.firebaseio.com/";
var ref = new Firebase(FireURL);
ref.authWithCustomToken("3Bdk3eWhR6QLEbVxhPA37rN4FdCMEsdNA9jcgKAr", function(error, authData) {
  if (error) {
    console.log("Authentication Failed!", error);
  }
});

module.exports = function(){
  return ref;
};
