const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Payment = require('../models/Donation');

// ✅ Admin statistikaları
router.get('/stats', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const categories = await Category.countDocuments();
    const income = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
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
router.get('/payments', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const donations = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    const total = donations.reduce((acc, d) => acc + d.amount, 0);

    res.json({
      donations,
      total
    });
  } catch (err) {
    console.error('Admin payments xətası:', err);
    res.status(500).json({ error: 'Ianələri yükləmək olmadı' });
  }
});


// ✅ Məhsulu sil
router.delete('/delete-product/:id', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Məhsul tapılmadı' });
    }
    res.json({ message: 'Məhsul silindi' });
  } catch (err) {
    console.error('Admin məhsul silmə xətası:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
});

router.get('/users', verifyToken, adminMiddleware, getAllUsers);
router.put('/update-user/:id', verifyToken, adminMiddleware, updateUser);
router.delete('/delete-user/:id', verifyToken, adminMiddleware, deleteUser);


module.exports = router;
