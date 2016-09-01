'use strict';
var qs = require('querystring');
var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var mongo = require('mongodb').MongoClient;
var dbUrl = process.env.MONGOLAB_URI;
/*
TODO: 

	Login: check if uname and pwd match
		if match redirect to main screen 
		not match alert to try again
	Main screen: 
		Show list of polls with links 

	Save user info here, use it in the GET requests to show the name, check if we're logged in etc.
	DB: For each poll store a doc with : 
		- Creator name
		- Poll title
		- Options: Vector of Pairs with [{name : votes}, ...] Initialized as {newOption: 0}
		

*/ 
module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/create')
		.get(function (req, res) {
			res.sendFile(path + '/public/create.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});
	app.route('/main')
		.get(function (req, res) {
			res.send("MAIN");
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/getpolls')
		.get(function (req, res){
			var v = [];
			res.send(v);
		});

	app.route('/api/newuser')
		.post(function (request, res){
			var obj = {
				'a': 10
			}
			//res.send(obj);
	        var body = '';
	        request.on('data', function (data) {
	            body += data;
	            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
	            if (body.length > 1e6) { 
	                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
	                request.connection.destroy();
	            }
	        });
	        request.on('end', function () {

	            var POST = qs.parse(body);
	            // use POST
	            console.log(POST)
	            var resObj = {
	            	"status" : "Ok", 
	            	"message": "Registered to the database, you can now login"
	            } 
	            mongo.connect(dbUrl, function (err, db){
	            	if (err) throw err;
	            	var users = db.collection('users');
	            	users.createIndex({"name":1}, {unique:true});
					
					try {
						users.insert({name : POST.name, password:POST.pwd}, function (err, data){
								if (err){
									throw err;
								}
								console.log("Inserted");
								console.log(data);
					});
					
	           		}
	           	catch(error){
	           			resObj = {
	            			"status" : "Error", 
	            			"message": "Couldn't register, name already in use"
	          			  } 
	           		}
					db.close()
	            });

	            res.send(resObj)
	        });

		});
		app.route('/api/login')
		.post(function (request, res){
			var obj = {
				'a': 10
			}
			//res.send(obj);
	        var body = '';
	        request.on('data', function (data) {
	            body += data;
	            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
	            if (body.length > 1e6) { 
	                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
	                request.connection.destroy();
	            }
	        });
	        request.on('end', function () {

	            var POST = qs.parse(body);
	            // use POST
	            console.log(POST)
	            var resObj = {
	            	"status" : "Error", 
	            	"message": "Couldn't log in"
	            } 
	            mongo.connect(dbUrl, function (err, db){
	            	if (err) throw err;
	            	var users = db.collection('users');
	            	users.count( {
	            				 "name": { $eq : POST.name}, 
	            				 "password": {$eq : POST.pwd}
	            				}, 

	            				function (err, count){
	            					if (err) throw err;
	            					console.log(count);
				            		if(count > 0) {
				            			console.log("Logged In");
				            			resObj = {
							            	"status" : "Ok", 
							            	"message": "Logged In"
							            } 
							        }
	            					res.send(resObj);
	            	});
					db.close()
	            });

	            
	        });

		});


}