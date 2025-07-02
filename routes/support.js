const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const controller = require('../controllers/supportController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// User routes
router.get('/user', verifyToken, controller.getUserSupportMessages);
router.post('/', verifyToken, upload.array('image', 30), controller.sendSupportMessage);

// Admin routes
router.get('/admin', verifyToken, isAdmin, controller.getAllSupportChats);
router.get('/admin/:userId', verifyToken, isAdmin, controller.getSupportMessagesWithUser);
router.post('/admin/:userId', verifyToken, isAdmin, upload.array('image',30), controller.sendSupportMessage);

module.exports = router;
