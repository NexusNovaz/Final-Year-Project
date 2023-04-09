const { Schema } = require('mongoose');
const mongoose = require('../../database')

const cardpackSchema = new Schema({
  discordId: String,
  nameOfPack: String,
  googleSheetsId: String,
  numOfQuestions: Number,
  enabledIn: { 
    type: [String], default: []
  },
  meta: {
      votes: { type: Number, default: 0 },
      favs: { type: Number, default: 0 }
  }
},{
  timestamps: true,
  collection: 'cards'
});

module.exports = CardPack = mongoose.model("CardPack", cardpackSchema);
