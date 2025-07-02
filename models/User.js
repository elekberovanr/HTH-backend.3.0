const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true },
  gender: { type: String },
  city: { type: String },
  profileImage: { type: String },
  bannerImage: { type: String }, 
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
