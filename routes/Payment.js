const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Ödəniş et
router.post('/', verifyToken, paymentController.createPayment);

// Öz ödənişlərini al
router.get('/', verifyToken, paymentController.getMyPayments);

module.exports = router;
