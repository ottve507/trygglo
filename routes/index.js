var express = require('express');
var router = express.Router();
//var User = mongoose.model('User');
var User = require('../models/user');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

// Search users
router.get('/search', ensureAuthenticated, function(req, res){
	User.find().exec(function(err, result) {
	    if (err) return console.log(err)
		res.render('search', {results: result});
	 })
});

// Search post
router.post('/search', function(req, res){
	var searchTerm = req.body.searchTerm;
	User.find({$text: {$search: searchTerm}}).exec(function(err, result) {
	    if (err) return console.log(err)
		res.render('search', {results: result});
	 })
});

//Post
router.post('/follow', User.addFollowers, function(req, res){
	//res.send({ success: true, message: 'Now Following' });
	console.log(req.body);
	res.send(req.body);
});

module.exports = router;