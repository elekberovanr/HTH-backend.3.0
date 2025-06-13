const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token yoxdur' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // Düzəliş buradadır

    if (!user) return res.status(401).json({ error: 'İstifadəçi tapılmadı' });

    req.userId = user._id;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token etibarsızdır' });
  }
};

module.exports = authMiddleware;
