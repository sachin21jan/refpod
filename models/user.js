var mongoose = require('mongoose');

//mongoose.connect("mongodb://refpoduser:refpod123@ds037622.mongolab.com:37622/refpod");

var UserSchema = mongoose.Schema({
    facebookId : {
        type: String
    },
    googleId : {
        type: String
    },
    firstName: {
        type: String
    }, 
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    isEmployer: {
        type: Boolean
    },
    googleFriends : []
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    newUser.save(callback);
};

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
    var query = {email: username};
    User.findOne(query, callback);
};

module.exports.getUserByFacebookId = function(facebookId, callback){
    var query = {facebookId: facebookId};
    User.findOne(query, callback);
};

module.exports.getUserByGoogleId = function(googleId, callback){
    var query = {googleId: googleId};
    User.findOne(query, callback);
};

module.exports.updateUser = function(email, newData, callback){
    var query = {email: email};
    User.findOneAndUpdate(query, newData, callback);
};

module.exports.comparePassword = function(candidatePassword, password, callback){
    if(candidatePassword === password){
        callback(null, true);
    } else {
        callback(null, false);
    }
};