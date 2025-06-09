const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { getMe } = require('../controllers/authController');

router.get('/me', authMiddleware, getMe);


router.post('/register', register);
router.post('/login', login);

module.exports = router;
