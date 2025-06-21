const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { createCategory, getCategories } = require('../controllers/categoryController');

// ✅ Yalnız admin kateqoriya əlavə edə bilər
router.post('/', auth, admin, createCategory);

// ✅ Hamı üçün kateqoriyalar
router.get('/', getCategories);

module.exports = router;
