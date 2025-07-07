const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, default: 'card' }, // optional: card, crypto, etc
  message: { type: String }, // optional message
}, {timestamps:true});

module.exports = mongoose.model('Donation', donationSchema);
