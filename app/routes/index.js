'use strict';
var qs = require('querystring');
var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var dbUrl = process.env.MONGOLAB_URI;
var userName = null; 
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
			res.sendFile(path + '/public/mainpage.html');
		});

	app.route('/api/addpoll')
		.post((req, res)=>{
			var addPoll = function (POST){
				var resObj = {
	            	"status" : "Ok", 
	            	"message": "Added poll to the database"
	            } 
	            mongo.connect(dbUrl, function (err, db){
	            	if (err) throw err;
	            	var polls = db.collection('polls');
	            	polls.insert(
	            		{title : POST.title, user : userName, opt: [{name: POST.opt1, votes: 0},{name: POST.opt2, votes: 0}]}, 
	            		function (err, data){
								if (err){					    
					           		resObj = {
					            			"status" : "Error", 
					            			"message": "Couldn't add poll"
					          		}
									throw err;
								}
								console.log("Inserted Poll for "+ userName);
								console.log(data);
					}); 
					db.close()
	            });
	            res.send(resObj)
			};
			parsePost(req, addPoll);
		});

	app.route('/api/addoption')
		.post((req, res)=>{
			var addOpt = function (POST){
				var resObj = {
	            	"status" : "Ok", 
	            	"message": "Added option to the database"
	            } 
	            mongo.connect(dbUrl, function (err, db){
	            	if (err) throw err;
	            	var polls = db.collection('polls');
	            	polls.update({_id : new ObjectId(POST.id)},
	            				 {$push : {opt: {name: POST.opt, votes: 0}}}, 
	            				 function (err, data){
										if (err){					    
							           		resObj = {
							            			"status" : "Error", 
							            			"message": "Couldn't add option to poll"
							          		}
											throw err;
										}
								console.log("Inserted option for "+ userName);
								console.log(data);
					}); 
					db.close()
	            });
	            res.send(resObj)
			};
			parsePost(req, addOpt);
		});
	app.route('/api/votefor')
		.post(function(req, res){
			console.log("We votin'")
			var addvote = function (POST){
				var resObj = {
	            	"status" : "Ok", 
	            	"message": "Voted ok"
	            } 
				 mongo.connect(dbUrl, function (err, db){
	            	if (err) throw err;
	            	var polls = db.collection('polls');
	            	console.log("WE INCREEMENT THE VOTES FOR "+ POST.name);
	            	polls.update({_id : new ObjectId(POST.id), "opt.name": POST.name},
	            				 {$inc : {"opt.$.votes" : 1}}, 
	            				 function (err, data){
										if (err){					    
							           		resObj = {
							            			"status" : "Error", 
							            			"message": "Couldn't add option to poll"
							          		}
											throw err;
										}
								console.log(data);
					}); 
					db.close()
	            });
	            res.send(resObj);
			}	
			parsePost(req, addvote);
		});
	app.route('/api/getuser')
		.post(function (req, res){
			var resObj = {
	            	"status" : "Ok", 
	            	"message": userName
	        } 
			res.send(resObj);
		});

	app.route('/api/getpolls')
		.post(function (req, res){
			var name = userName; 
			mongo.connect(dbUrl, (err, db)=>{
				var polls = db.collection('polls');
				var result = polls.find({ user :{$eq : name}},{
					// _id:0, name:0, title: 1, opt:0
				}).toArray();
				result.then(function (resu){
					console.log(resu);
					res.send(resu);
				});
				db.close(); 
			});
		});

	app.route('/api/poll')
		.post(function (req, res){
			var search = function(POST){
	            mongo.connect(dbUrl, function (err, db){
	            	if (err) throw err;
	            	var polls = db.collection('polls');
	            	
	            	var result = polls.find({ "_id" :  new ObjectId(POST.id)},{
							// _id:0, name:0, title: 1, opt:0
						}).toArray();
						result.then(function (resu){
							console.log("the result is: "+resu);
							res.send(resu[0]);
						});
				db.close();
	            });
			}
			parsePost(req, search);
		});

	app.route('/api/newuser')
		.post(function (request, res){
			var create = function(POST){
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
			}
			parsePost(request, create);

		});
		app.route('/api/logout')
		.post(function (request, res){
			userName = null; 
		});

		app.route('/api/login')
		.post(function (request, res){
			var logIn = function(POST){ 
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
							            userName = POST.name;
							        }
	            					res.send(resObj);
	            	});
					db.close()
	            });
	        }
	        parsePost(request, logIn);
		});
	app.route('/api/delPoll')
		.post(function (req, res){
			var del = function (POST){
				mongo.connect(dbUrl, function (err, db){
					var polls = db.collection('polls');

					var query = {
						_id: new ObjectId(POST.id)
					}

					polls.remove(query, (err)=>{
						if (err) throw err 
						else {
							console.log("poll removed");
							var resObj = {
							            	"status" : "Ok", 
							            	"message": "Poll deleted"
							            } ;
							res.send(resObj);
							}
					}
					);
					db.close();
				});
			};
			parsePost(req, del);
		});	
	app.route('/:name/:id')
		.get(function (req, res){
			res.sendFile(path +"/public/pollpage.html");
			/* 
				client-side: window.location.pathname
			*/
			})
		.post(function (req, res ){

		});
	app.get("/favicon.ico", (req, res )=>{

	});
}

function parsePost(request, callback){
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
	            callback(POST);
	        });
}