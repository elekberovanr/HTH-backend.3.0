const Message = require('../models/Chat');

// Yeni mesaj göndər
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const message = await Message.create({
      sender: req.userId,
      receiver,
      content
    });
    res.status(201).json(message);
  } catch (err) {
    console.error('Message send error:', err);
    res.status(500).json({ error: 'Mesaj göndərilə bilmədi' });
  }
};

// Söhbət mesajlarını al
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ error: 'Mesajlar alınmadı' });
  }
};
