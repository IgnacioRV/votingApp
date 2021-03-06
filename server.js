'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
//var mongoose = require('mongoose');
//var passport = require('passport');
//var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
require('dotenv').load();
// require('./app/config/passport')(passport);
// mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/public/css', express.static(process.cwd() + '/public/css'));
app.use('/common', express.static(process.cwd() + '/app/common'));
/*
app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
*/
var passport = "";
routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});