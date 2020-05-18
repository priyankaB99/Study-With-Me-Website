const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config()

var connection = mongoose.createConnection(process.env.DB_CONNECTION_2,{ useNewUrlParser: true, useUnifiedTopology: true });
autoIncrement.initialize(connection);
//create schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    friends : [{
        type: String,
        required: false
    }],
    channelInvitations: [{
        type: String,
        required: false
    }],
});

UserSchema.plugin(autoIncrement.plugin, 'users');
//var UserID = connection.model('UserID', UserSchema);

module.exports = User = mongoose.model('users', UserSchema);