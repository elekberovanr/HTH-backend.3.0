const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const axios = require('axios');


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

const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, city, gender, birthday } = req.body;

    const updatedData = { name, city, gender, birthday };

    if (req.files?.profileImage && req.files.profileImage[0]) {
      updatedData.profileImage = req.files.profileImage[0].filename;
    }

    if (req.files?.bannerImage && req.files.bannerImage[0]) {
      updatedData.bannerImage = req.files.bannerImage[0].filename;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Profil yenilənmədi' });
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

// 🔐 REGISTER with reCAPTCHA
const register = async (req, res) => {
  try {
    const { name, email, password, gender, birthday, city, captcha } = req.body;

    // ✅ 1. Check missing fields
    if (!name || !email || !password || !gender || !birthday || !city || !captcha) {
      return res.status(400).json({ error: 'Bütün sahələr doldurulmalıdır və captcha təsdiqlənməlidir.' });
    }

    // ✅ 2. Validate captcha with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`;
    const { data } = await axios.post(verifyUrl);

    if (!data.success || data.score < 0.5) {
      return res.status(400).json({ error: 'Captcha təsdiqlənmədi. Zəhmət olmasa yenidən cəhd edin.' });
    }

    // ✅ 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email ilə artıq istifadəçi mövcuddur' });
    }

    // ✅ 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file?.filename || 'Default-User.png';

    // ✅ 5. Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      birthday: new Date(birthday),
      city,
      profileImage,
    });

    await user.save();

    // ✅ 6. Create token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });

  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ error: 'Server xətası baş verdi' });
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
