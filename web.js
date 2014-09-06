var express = require('express');
var $ = require('jquery');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var _ = require('underscore');
var request = require('request');
var url = require('url');

var notes = require('./routes/getNotes');

var app = express();
var http = require('http').Server(app);

// In order to track of req's body. ;)
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());

// In order to track sessions and cookies
app.use(cookieParser('JBai23'));

//setup views and path
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');

//Routes
app.get('/evernote/:token', notes.getNotes);

//server
var server = http.listen(1000, function() {
    console.log('Listening on port %d', server.address().port);
});
