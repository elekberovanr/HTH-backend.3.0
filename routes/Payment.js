const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createPayment, getMyPayments } = require('../controllers/paymentController');

router.post('/', auth, createPayment);
router.get('/my', auth, getMyPayments);

module.exports = router;
