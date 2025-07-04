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

    const senderId = req.user.id;
    let receiverId = req.user.isAdmin ? req.params.userId : null;

    if (!req.user.isAdmin) {
      const admin = await User.findOne({ isAdmin: true });
      if (admin) receiverId = admin._id;
    }

    const message = new SupportMessage({
      sender: senderId,
      receiver: receiverId,
      content,
      image: images,
      unreadCounts: {
        [receiverId]: 1,
        [senderId]: 0
      },
      readBy: [senderId],
    });

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
    const adminId = req.user.id;
    const messages = await SupportMessage.find();
    const users = new Set();

    messages.forEach((msg) => {
      if (msg.sender && !msg.sender.equals(adminId)) users.add(msg.sender.toString());
      if (msg.receiver && !msg.receiver.equals(adminId)) users.add(msg.receiver.toString());
    });

    const userList = await User.find(
      { _id: { $in: [...users] } },
      'name username email profileImage'
    );

    const userData = await Promise.all(
      userList.map(async (user) => {
        const unreadCount = await SupportMessage.countDocuments({
          $or: [
            { sender: user._id, receiver: adminId },
            { sender: adminId, receiver: user._id }
          ],
          [`unreadCounts.${adminId}`]: { $gt: 0 }
        });
        return { ...user.toObject(), unreadCount };
      })
    );

    res.json(userData);
  } catch (err) {
    console.error('getAllSupportChats error:', err);
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


exports.markSupportMessagesAsRead = async (req, res) => {
  const { userId } = req.params; // oxuyan şəxs
  const { chatWith } = req.body; // qarşı tərəf

  try {
    await SupportMessage.updateMany(
      {
        $or: [
          { sender: chatWith, receiver: userId },
          { sender: userId, receiver: chatWith },
        ],
        [`unreadCounts.${userId}`]: { $gt: 0 },
      },
      { $set: { [`unreadCounts.${userId}`]: 0 } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Oxunma statusu yenilənmədi:', err);
    res.status(500).json({ message: 'Oxunma statusu yenilənmədi' });
  }
};

