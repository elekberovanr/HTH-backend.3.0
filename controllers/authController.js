const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// 🔐 Register
const register = async (req, res) => {
  try {
    const { name, email, password, gender, birthday, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email artıq mövcuddur' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? req.file.filename : 'Default-User.png';

    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      birthday,
      city,
      profileImage
    });

    await user.save();

    // ✅ isAdmin əlavə olunur:
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Qeydiyyat zamanı xəta:', err);
    res.status(500).json({ error: 'Server xətası baş verdi' });
  }
};

// 🔑 Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'İstifadəçi tapılmadı' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Parol yanlışdır' });

    // ✅ isAdmin əlavə olunur:
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server xətası' });
  }
};

// 🙋‍♀️ Profil məlumatı
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
};

// 🛠️ Profil yeniləmə
const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, city, gender, birthday } = req.body;

    const updateData = {
      name,
      city,
      gender,
      birthday,
    };

    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const updated = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// 📩 Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'HTH Şifrə sıfırlama kodu',
      text: `Kodunuz: ${code}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Kod göndərildi' });
  } catch (err) {
    console.error('Mail xətası:', err);
    res.status(500).json({ error: 'Kod göndərilə bilmədi' });
  }
};

// 🔁 Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email, resetCode: code });
    if (!user || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ error: 'Kod etibarsızdır və ya vaxtı keçib' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Şifrə yeniləndi' });
  } catch (err) {
    res.status(500).json({ error: 'Şifrə dəyişdirilə bilmədi' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateUser,
  forgotPassword,
  resetPassword,
};
