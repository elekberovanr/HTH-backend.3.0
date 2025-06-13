const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createCategory, getCategories } = require('../controllers/categoryController');

// Admin əlavə edir
router.post('/', auth, createCategory);

// Hamı üçün kateqoriyalar
router.get('/', getCategories);

module.exports = router;
