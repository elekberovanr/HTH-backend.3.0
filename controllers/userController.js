const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Bütün istifadəçiləri gətir
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('İstifadəçiləri yükləmək olmadı:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, city, gender, birthday } = req.body;
    const updatedData = {
      name,
      city,
      gender,
      birthday,
    };

    if (req.files?.profileImage && req.files.profileImage[0]) {
      updatedData.profileImage = req.files.profileImage[0].filename;
    }

    if (req.files?.bannerImage && req.files.bannerImage[0]) {
      updatedData.bannerImage = req.files.bannerImage[0].filename;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Profil yenilənmədi' });
  }
};



// İstifadəçini sil
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'İstifadəçi silindi' });
  } catch (err) {
    console.error('İstifadəçi silinmədi:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};
