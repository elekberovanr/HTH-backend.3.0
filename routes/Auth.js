const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Register və login
router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);

// Profil
router.get('/me', authMiddleware, getMe);
router.put('/update', authMiddleware, upload.single('profileImage'), updateUser);

// Şifrə sıfırlama
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
