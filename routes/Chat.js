const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Yeni chat
router.post('/', verifyToken, chatController.startChat);

// Bütün chatləri göstər
router.get('/:userId', verifyToken, chatController.getUserChats);

// Mesaj əlavə et
router.post('/message', verifyToken, chatController.sendMessage);

// Mesajları al
router.get('/messages/:chatId', verifyToken, chatController.getMessages);

// Mesaj sil
router.delete('/message/:id', verifyToken, chatController.deleteMessage);

module.exports = router;
