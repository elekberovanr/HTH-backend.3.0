const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false },
  isSupport: { type: Boolean, default: false },
  content: {
    type: String,
    required: function () {
      return !this.image;
    },
  },
  image: {
    type: String,
  }



}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
