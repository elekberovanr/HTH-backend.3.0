const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { getAllUsers } = require('../controllers/userController');
const User = require('../models/User');

router.get('/public', getAllUsers); // 🔓 Bu sadəcə profil listi üçündür
router.get('/', verifyToken, admin, getAllUsers);
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
