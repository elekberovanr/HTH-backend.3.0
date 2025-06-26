const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

router.get('/', verifyToken, getFavorites);
router.post('/', verifyToken, addFavorite);
router.delete('/:productId', verifyToken, removeFavorite);

module.exports = router;
