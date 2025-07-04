const SupportMessage = require('../models/SupportMessage');
const User = require('../models/User');
const { io } = require('../server'); 

exports.getUserSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
      .populate('sender', 'name username profileImage')
      .populate('receiver', 'name username profileImage')
      .sort('createdAt');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get support messages' });
  }
};


exports.sendSupportMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    const message = new SupportMessage({
      sender: req.user.id,
      receiver: req.user.isAdmin ? req.params.userId : null,
      content,
      image: images,
    });

    if (!req.user.isAdmin) {
      const admin = await User.findOne({ isAdmin: true });
      if (admin) message.receiver = admin._id;
    }

    await message.save();

    const populated = await SupportMessage.findById(message._id)
      .populate('sender', 'name profileImage isAdmin')
      .populate('receiver', 'name profileImage isAdmin');

    io.of('/support').emit('newMessage', populated);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllSupportChats = async (req, res) => {
  try {
    const messages = await SupportMessage.find();
    const users = new Set();

    messages.forEach((msg) => {
      if (msg.sender && !msg.sender.equals(req.user.id)) users.add(msg.sender.toString());
      if (msg.receiver && !msg.receiver.equals(req.user.id)) users.add(msg.receiver.toString());
    });

    const userList = await User.find({ _id: { $in: [...users] } }, 'name username email profileImage');
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chat users' });
  }
};

exports.getSupportMessagesWithUser = async (req, res) => {
  try {
    const messages = await SupportMessage.find({
      $or: [
        { sender: req.params.userId },
        { receiver: req.params.userId }
      ]
    })
      .populate('sender', 'name username profileImage')
      .populate('receiver', 'name username profileImage')
      .sort('createdAt');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages with user' });
  }
};
