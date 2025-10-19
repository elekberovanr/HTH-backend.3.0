const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');
const upload = require('../middleware/upload');

router.post('/', verifyToken, chatController.startChat);
router.get('/user/:userId', verifyToken, chatController.getUserChats);
router.get('/chat-info/:id', verifyToken, chatController.getChat);
router.get('/messages/:chatId', verifyToken, chatController.getMessages);
router.delete('/message/:id', verifyToken, chatController.deleteMessage);
router.put('/read/:senderId', verifyToken, chatController.markMessagesAsRead);
router.post('/message', verifyToken, upload.single('image'), chatController.sendMessage);



module.exports = router;
