const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:productId', controller.getCommentsWithReplies);
router.post('/', verifyToken, controller.addComment);
router.delete('/:id', verifyToken, controller.deleteComment);


module.exports = router;
