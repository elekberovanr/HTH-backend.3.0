// models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true }); // 🟢 vacib

module.exports = mongoose.model('Chat', ChatSchema);
