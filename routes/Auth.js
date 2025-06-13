const express = require('express');
const router = express.Router();
const { register, login, updateUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { getMe } = require('../controllers/authController');
const upload = require('../middleware/upload');

router.put('/update', authMiddleware, upload.single('profileImage'), updateUser);


router.get('/me', authMiddleware, getMe);

router.post('/register', register);
router.post('/login', login);

module.exports = router;
