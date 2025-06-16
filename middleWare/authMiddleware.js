const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token yoxdur' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    req.user = await User.findById(req.userId);
    next();
  } catch {
    res.status(401).json({ error: 'Token etibarsızdır' });
  }
};

module.exports = authMiddleware;
