const Donation = require('../models/Donation');

exports.makeDonation = async (req, res) => {
  try {
    const { amount, message, method } = req.body;
    const userId = req.user.id;

    const donation = new Donation({
      user: userId,
      amount,
      method,
      message,
    });

    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Donation failed' });
  }
};

exports.getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.id }).sort('-date');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};


exports.getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const categories = await Category.countDocuments();
    const donations = await Donation.find();

    const income = donations.reduce((total, d) => total + d.amount, 0);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      users,
      products,
      categories,
      income,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('user', 'name email');
    const income = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ donations, income });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

