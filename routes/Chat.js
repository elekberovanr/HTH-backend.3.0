const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleWare/authMiddleware');

// ✅ Yeni chat başlat (əgər yoxdursa)
router.post('/', auth, async (req, res) => {
  const { receiverId } = req.body;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, receiverId] }
    });
    if (!chat) {
      chat = await Chat.create({ participants: [req.userId, receiverId] });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Chat yaratmaq mümkün olmadı' });
  }
});

// ✅ Bütün chatləri göstər
router.get('/:userId', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate('participants', 'username profileImage');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Chatləri almaqda xəta' });
  }
});

// ✅ Mesaj əlavə et
router.post('/message', auth, async (req, res) => {
  const { chatId, content } = req.body;
  try {
    const message = await Message.create({
      chat: chatId,
      sender: req.userId,
      content
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Mesaj göndərmək mümkün olmadı' });
  }
});

// ✅ Mesajları al
router.get('/messages/:chatId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profileImage');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Mesajlar alınmadı' });
  }
});

module.exports = router;
