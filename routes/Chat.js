const express = require('express');
const router = express.Router();
const auth = require('../middleWare/authMiddleware');
const chatController = require('../controllers/chatController');

// Yeni chat
router.post('/', auth, chatController.startChat);

// Bütün chatləri göstər
router.get('/:userId', auth, chatController.getUserChats);

// Mesaj əlavə et
router.post('/message', auth, chatController.sendMessage);

// Mesajları al
router.get('/messages/:chatId', auth, chatController.getMessages);

// Mesaj sil
router.delete('/message/:id', auth, chatController.deleteMessage);

module.exports = router;
