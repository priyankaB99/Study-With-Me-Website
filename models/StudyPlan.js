const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config()

var connection = mongoose.createConnection(process.env.DB_CONNECTION_2,{ useNewUrlParser: true, useUnifiedTopology: true });
autoIncrement.initialize(connection);
//create schema
const SPSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    deadline: {
        type: String,
        required: true
    },
    items: [{
        name: String,
        deadline: String,
    }]
});

SPSchema.plugin(autoIncrement.plugin, 'studyplan');
//var UserID = connection.model('UserID', ChannelSchema);

module.exports = StudyPlan = mongoose.model('studyplan', SPSchema);