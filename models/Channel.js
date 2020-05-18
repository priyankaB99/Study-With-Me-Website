const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config()

var connection = mongoose.createConnection(process.env.DB_CONNECTION_2,{ useNewUrlParser: true, useUnifiedTopology: true });
autoIncrement.initialize(connection);
//create schema
const ChannelSchema = new Schema({
    owner: {
        type: String,
        required: true
    },
    channelName: {
        type: String,
        required: true
    },
    isPrivate: {
        type: Boolean,
        required: true
    },
    kickedOutUsers: [{
        type: String,
        required: false
    }],
    posts: [{
        user: String,
        title: String,
        content: String
    }],
    toDoList: [{
        type: String
    }],
    completedTasks: [{
        type: String
    }]
});

ChannelSchema.plugin(autoIncrement.plugin, 'channels');
//var UserID = connection.model('UserID', ChannelSchema);

module.exports = Channel = mongoose.model('channels', ChannelSchema);