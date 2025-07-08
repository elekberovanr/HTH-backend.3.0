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

    const isClosed = messages.length > 0 ? messages[0].closed : false;

    res.json({ messages, isClosed });
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

    // Ən son mesajı tap və əgər ticket bağlıdırsa göndərmə
    const lastMessage = await SupportMessage.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: -1 });

    if (lastMessage?.closed) {
      return res.status(403).json({ message: 'Ticket is closed' });
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
    const messages = await SupportMessage.find().sort({ createdAt: -1 });

    const users = new Map(); // key: userId, value: { lastMessage, unreadCount }

    for (const msg of messages) {
      const senderId = msg.sender?.toString();
      const receiverId = msg.receiver?.toString();

      const otherUserId =
        senderId === adminId ? receiverId :
        receiverId === adminId ? senderId : null;

      if (!otherUserId) continue;

      if (!users.has(otherUserId)) {
        const unreadCount = await SupportMessage.countDocuments({
          $or: [
            { sender: otherUserId, receiver: adminId },
            { sender: adminId, receiver: otherUserId }
          ],
          [`unreadCounts.${adminId}`]: { $gt: 0 }
        });

        users.set(otherUserId, {
          lastMessage: msg,
          unreadCount
        });
      }
    }

    const userIds = [...users.keys()];
    const userList = await User.find(
      { _id: { $in: userIds } },
      'name username email profileImage'
    );

    const response = userList.map((user) => {
      const info = users.get(user._id.toString());
      return {
        ...user.toObject(),
        unreadCount: info?.unreadCount || 0,
        lastMessage: info?.lastMessage || null
      };
    });

    res.json(response);
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

    const isClosed = messages.length > 0 ? messages[0].closed : false;

    res.json({ messages, isClosed });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages with user' });
  }
};

exports.markSupportMessagesAsRead = async (req, res) => {
  const { userId } = req.params;
  const { chatWith } = req.body;

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

exports.toggleTicketStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await SupportMessage.find({
      $or: [{ sender: id }, { receiver: id }],
    }).sort({ createdAt: -1 });

    if (!messages.length) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const latest = messages[0];
    latest.closed = !latest.closed;
    await latest.save();

    // Qarşı tərəfə socket ilə bildiriş göndər
    const notifyUser = latest.sender.toString() === id ? latest.receiver : latest.sender;
    io.of('/support').to(notifyUser.toString()).emit('ticketStatusChanged', {
      closed: latest.closed,
    });

    // Əgər ticket bağlandısa 1 saat sonra istifadəçidən silinsin
    if (latest.closed) {
      setTimeout(async () => {
        try {
          await SupportMessage.deleteMany({
            $or: [{ sender: id }, { receiver: id }],
          });
        } catch (e) {
          console.error('Mesajları silmək mümkün olmadı:', e.message);
        }
      }, 3600000); // 1 saat = 3600000 ms
    }
    res.status(200).json({ message: 'Ticket status updated', closed: latest.closed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
