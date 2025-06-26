const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token yoxdur' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) return res.status(401).json({ error: 'İstifadəçi tapılmadı' });

    req.userId = user._id;
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware xətası:', err);
    res.status(401).json({ error: 'Token etibarsızdır' });
  }
};

module.exports = { verifyToken };
