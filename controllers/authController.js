const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      console.log("REQ BODY:", req.body); 
      
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      const hash = await bcrypt.hash(password, 10);
      await User.create({ username, email, password: hash });
  
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({ error: 'Register error' });
    }
  };

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Wrong credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login error' });
    }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

