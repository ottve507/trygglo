var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	facebook : {
		id           : String,
		token        : String
	},
	resetPasswordToken: {type: String},
	resetPasswordExpires: {type: Date},
	following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	posts : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});
UserSchema.index({username: 'text'});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.addFollowers = function (req, res, next){
	User.findOneAndUpdate({_id: req.body.current_user}, {$push: {following: req.body.to_follow}}, next)
	User.findOneAndUpdate({_id: req.body.to_follow}, {$push: {following: req.body.current_user}}, next)
};

module.exports.addPost = function (req, res, next){
	User.findOneAndUpdate({_id: req.user._id}, {$push: {posts: req.body.to_follow}}, next)
};

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}