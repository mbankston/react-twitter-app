// Require our dependencies
var express = require('express'),
  exphbs = require('express-handlebars'),
  http = require('http'),
  mongoose = require('mongoose'),
  twitter = require('twitter'),
  routes = require('./routes'),
  config = require('./config'),
  streamHandler = require('./utils/streamHandler');

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

var mongoURI = process.env.MONGOLAB_URI;
var mongoDB = mongoose.connect(mongoURI).connection;

mongoDB.on('error', function(err){
    if(err){
        console.log("MONGO ERROR: ", err);
    }
});

mongoDB.once('open', function(){
    console.log("Mongo is on ( ͡° ͜ʖ ͡°)");
});
// Connect to our mongo database
// mongoose.connect('mongodb://localhost/react-tweets');

// Create a new ntwitter instance
var twit = new twitter(config.twitter);

// Index Route
app.get('/', routes.index);

// Page Route
app.get('/page/:page/:skip', routes.page);

// Set /public as our static content dir
app.use("/", express.static(__dirname + "/public/"));

// Fire this bitch up (start our server)
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening o port ' + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);

// Set a stream listenminnesotar tweets matching tracking keywords
twit.stream('statuses/filter',{ track: '#minnesota, primedigitalacademy,javascript'}, function(stream){
  streamHandler(stream,io);
});
