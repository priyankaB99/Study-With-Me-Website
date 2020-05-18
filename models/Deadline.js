const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config()

var connection = mongoose.createConnection(process.env.DB_CONNECTION_2,{ useNewUrlParser: true, useUnifiedTopology: true });
autoIncrement.initialize(connection);
//create schema
const DeadlineSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    channelName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    
});

DeadlineSchema.plugin(autoIncrement.plugin, 'deadlines');
//var UserID = connection.model('UserID', ChannelSchema);

module.exports = Deadline = mongoose.model('deadlines', DeadlineSchema);