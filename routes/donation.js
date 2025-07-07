const express = require('express');
const router = express.Router();
const { makeDonation, getUserDonations, getAllDonations } = require('../controllers/donationController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, makeDonation);
router.get('/my', verifyToken, getUserDonations);
router.get('/all', verifyToken, verifyAdmin, getAllDonations);
router.get('/payments', verifyToken, verifyAdmin, getAllDonations);


module.exports = router;
