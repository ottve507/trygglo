var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var async = require('async');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
//Requiring user-schema for registering etc.
var User = require('../models/user');

//Handles the passport authentication methods
require('../config/passport.js')(passport, LocalStrategy, FacebookStrategy);



// Register - GET 
router.get('/register', function(req, res){
	res.render('account/register');
});

// Register - POST
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

// Login - GET
router.get('/login', function(req, res){
	res.render('account/login');
});

// Login - POST
router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});

// Logout - GET
router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

// Login Facebook - GET
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

 // handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
     passport.authenticate('facebook', {
         successRedirect : '/',
         failureRedirect : '/'
}));

//Forgot GET
router.get('/forgot', function(req, res){
  if (req.isAuthenticated()) {
    return res.redirect('/');
  } else {
	res.render('account/forgot', {
	    title: 'Forgot Password'
	});
   }
});


//Forgot POST
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
		 
          req.flash('error_msg', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
	  console.log("HELLO");
	
	  var smtpTransport = nodemailer.createTransport({
	  service: 'Gmail', 
	  auth: {
          user: 'miathetradebot@gmail.com',
          pass: 'MiaBesson'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'miathetradebot@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});

//Reset password
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired.');
      return res.redirect('account/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

//Reset Post
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
		
		user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
		
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(user.password, salt, function(err, hash) {
		        user.password = hash;
				user.save(function(err) {
		          req.logIn(user, function(err) {
		            done(err, user);
		          });
			
		    });
		});
        });
      });
    },
    function(user, done) {
 	
	  var smtpTransport = nodemailer.createTransport({
	  service: 'Gmail', 
	  auth: {
          user: 'miathetradebot@gmail.com',
          pass: 'MiaBesson'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'miathetradebot@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});



module.exports = router;