var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Post = require('../models/post');
var User = mongoose.model('User');
var NodeGeocoder = require('node-geocoder');

// Post page
router.get('/post', function(req, res){
	Post.find().populate('user').exec(function(err, result) {
	    if (err) return console.log(err)
		res.render('posts/post', {posts: result});
	 })
});

//Show individual post
router.get('/:id', (req, res) => {
  // find the post in the `posts` array

  //var post = req.db.collection('posts').find({_id : req.params.id})
  //var post = Post.findById({_id : req.params.id})
  //var post = req.post

	//Post.find({id: req.params.id}).populate('user').exec(function(err, post) {
  	Post.findById(req.params.id, function(err, post) {
		    if (err) return next(err);	    
			post.populate('user',function(error, post){
				res.render('posts/show', {
					post: post
				  })
			});
		});  
})


// Register post
router.post('/post', function(req, res){
	var name = req.body.name;
	var text = req.body.text;
	var user = req.user;
	
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('text', 'Text is required').notEmpty();
	
	var errors = req.validationErrors();

	if(errors){
		req.flash('error_msg', 'Failed to post');
		res.redirect('post');
	} else {
		
		//Do A post request
		var request = require('request');
		var url ='http://requestb.in/w7b3y4w7'	
		
		request(url, function (error, response, body) {
			//console.log(response);
			console.log("ERRORS: " + error);
			console.log("BODY: " + body);
		  if (!error) {
		    console.log(body);
		  }
		})

		var newPost = new Post({
			name: name,
			text:text,
			user:user
		});

		Post.createPost(newPost, function(err, post){
			if(err) throw err;
			console.log(post);
		});
			
			req.flash('success_msg', 'Posted');
			res.redirect('post');
	}
});

function queryGoogleMaps(returnJSON, callback){
	var options = {
	  provider: 'google',

	  // Optional depending on the providers
	  httpAdapter: 'https', // Default
	  apiKey: 'AIzaSyDZ2EUjyWJ-MWpBe4omjDSfcz1o-uO-gso',
	  formatter: null         // 'gpx', 'string', ...
	};

	var geocoder = NodeGeocoder(options);
	
	geocoder.geocode(returnJSON, function(err, res) {
		if(res){
			callback(err, res[0]);
		}else{
			callback(err,"");
		}
	});
}

module.exports = router;