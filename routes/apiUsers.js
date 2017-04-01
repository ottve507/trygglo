// Import dependencies
var express = require('express');  
var jwt = require('jsonwebtoken');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('../config/main');

var User = require('../models/user');

router.post('/login', function(req, res) {
	console.log(req.body)
	  User.findOne({username: req.body.username}, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
		User.comparePassword(req.body.password, user.password, function(err, isMatch){
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
            var token = jwt.sign(user, config.secret, {
              expiresIn: 10080 // in seconds
            });
            res.json({ success: true, token: 'JWT ' + token });
          } else {
            res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    });
});

module.exports = router;