// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ Bütün istifadəçiləri gətir
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('İstifadəçiləri yükləmək olmadı:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};

// ✅ İstifadəçini güncəllə
exports.updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updates = { username, email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('İstifadəçi güncəllənmədi:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};

// ✅ İstifadəçini sil
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'İstifadəçi silindi' });
  } catch (err) {
    console.error('İstifadəçi silinmədi:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};
