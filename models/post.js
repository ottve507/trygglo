var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Post Schema
var PostSchema = mongoose.Schema({
	user: {type: mongoose.Schema.ObjectId, ref: 'User'},
	//location: {type: [Number], required: true},
	name: {
		type: String,
		index:true
	},
	text: {
		type: String
	}
});

var Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.createPost = function(newPost, callback){
	newPost.save(callback);
}
