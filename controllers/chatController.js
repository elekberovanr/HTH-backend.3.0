const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Yeni chat başlat
exports.startChat = async (req, res) => {
  const { receiverId } = req.body;
  try {
    let chat = await Chat.findOne({ participants: { $all: [req.userId, receiverId] } });
    if (!chat) {
      chat = await Chat.create({ participants: [req.userId, receiverId] });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Chat yaratmaq mümkün olmadı' });
  }
};

// Bütün chatləri al
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate('participants', 'username profileImage');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Chatləri almaqda xəta' });
  }
};

// Mesaj əlavə et
exports.sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  try {
    const message = await Message.create({
      chat: chatId,
      sender: req.userId,
      content
    });
    await message.populate('sender', 'username profileImage');
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Mesaj göndərmək mümkün olmadı' });
  }
};

// Mesajları al
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profileImage');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Mesajlar alınmadı' });
  }
};

// Mesaj sil
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Mesaj tapılmadı' });

    const senderId = message.sender._id ? message.sender._id.toString() : message.sender.toString();
    if (senderId !== req.userId) return res.status(403).json({ error: 'İcazə yoxdur' });

    await message.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Silinmə zamanı xəta baş verdi' });
  }
};
