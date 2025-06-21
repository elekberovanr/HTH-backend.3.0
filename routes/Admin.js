const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Payment = require('../models/Payment'); // əgər mövcuddursa

const authMiddleware = require('../middleware/authMiddleware');
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const categories = await Category.countDocuments();
    const income = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      users,
      products,
      categories,
      income: income[0]?.total || 0,
      recentUsers,
    });
  } catch (err) {
    console.error('Admin stats xətası:', err);
    res.status(500).json({ error: 'Statistika alınmadı' });
  }
});

module.exports = router;
