const SupportMessage = require('../models/SupportMessage');
const User = require('../models/User');
const supportUsers = require('../supportUsers');

const getNamespace = () => {
  const io = require('../server').io;
  return io.of('/support');
};

// 🟣 USER: Öz mesajlarını alır
exports.getUserSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('User support mesajı xətası:', err);
    res.status(500).json({ error: 'Mesajlar alınmadı' });
  }
};

exports.getAllSupportChats = async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .populate('sender', 'username email profileImage')
      .populate('receiver', 'username email profileImage')
      .sort({ createdAt: -1 });

    const grouped = {};

    for (const msg of messages) {
      const sender = msg.sender;
      const receiver = msg.receiver;

      if (!sender || !receiver) continue; // ⚠️ Boş olanları atla

      const userId = msg.isAdmin
        ? receiver._id?.toString()
        : sender._id?.toString();

      if (userId && !grouped[userId]) {
        grouped[userId] = msg;
      }
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('❌ Admin support chat xətası:', err);
    res.status(500).json({ error: 'Mesajlar alınmadı' });
  }
};



// 🔵 ADMIN: Seçilmiş userlə yazışma
exports.getSupportMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await SupportMessage.find({
      $or: [
        { sender: userId, receiver: req.userId },
        { sender: req.userId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Admin/user mesajları xətası:', err);
    res.status(500).json({ error: 'Mesajlar alınmadı' });
  }
};

// 📨 Mesaj Göndər
exports.sendSupportMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const files = req.files; // ✅ array of files

    let receiverId;
    if (req.user.isAdmin && req.params.userId) {
      receiverId = req.params.userId;
    } else {
      const admin = await User.findOne({ isAdmin: true });
      if (!admin) return res.status(404).json({ error: 'Admin tapılmadı' });
      receiverId = admin._id;
    }

    const imagePaths = files?.map(file => file.filename) || []; // ✅ filenames array

    const newMessage = await SupportMessage.create({
      sender: req.userId,
      receiver: receiverId,
      content: content || '',
      image: imagePaths,
      isAdmin: !!req.user.isAdmin,
    });

    const namespace = getNamespace();
    const receiverSocketId = supportUsers[receiverId];
    if (receiverSocketId) {
      namespace.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Support mesaj xətası:', err);
    res.status(500).json({ error: 'Mesaj göndərilmədi' });
  }
};
