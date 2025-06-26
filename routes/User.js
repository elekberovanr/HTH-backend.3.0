const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { getAllUsers } = require('../controllers/userController'); // ✅ düz ad

const User = require('../models/User');

// ✅ Admin: bütün istifadəçiləri al
router.get('/', verifyToken, admin, getAllUsers);

// ✅ Tək istifadəçi profili (public)
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
