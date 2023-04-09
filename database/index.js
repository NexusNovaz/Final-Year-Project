const { mongoDBConnectionURI } = require('../config.json') 

// Connect to database
const mongoose = require('mongoose');
const { ModalSubmitFields } = require('discord.js');
mongoose.connect(mongoDBConnectionURI, { useNewUrlParser: true })
    .then(console.log('Connected to Mongodb.'))
    .catch((err) => console.error(err));

module.exports = mongoose;