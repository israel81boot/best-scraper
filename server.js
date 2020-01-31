var express = require("express");
var app = express();
var mongoose = require("mongoose");
var  PORT = process.env.PORT || 3000;

var logger = require("morgan");
var port = express ();

var route = express.Router();
var MONGODB_URI = process.env.MONGODB_URI; // || ; 
mongoose.connect("mongodb://localhost/holderdb", { useNewUrlParser: true});  //(MONGODB_URI, function(err){
 // assert.equal(null,err); 
 // console.log("connected successfully to server"); 

//},{ useNewUrlParser: true }); 
app.use(express.static(__dirname = "./public"));

 var assert = require('assert');



var PORT = 3000; 

var app = express(); 

app = express(); 

//app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

require("./routes/hold.js")(app, db);


app.listen(PORT, function(){
    console.log("PORT running on port" + PORT + "!");
});
