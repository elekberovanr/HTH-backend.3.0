const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory
} = require('../controllers/categoryController');

router.post('/', verifyToken, admin, createCategory);
router.get('/', getCategories);
router.delete('/:id', verifyToken, admin, deleteCategory);
router.put('/:id', verifyToken, admin, updateCategory);

module.exports = router;
