const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById,
  getMyProducts
} = require('../controllers/productController');

// Yeni məhsul (şəkil ilə)
router.post('/', authMiddleware, upload.single('image'), addProduct);

// Bütün məhsullar
router.get('/', getProducts);

// Məhsul detalları
router.get('/:id', getProductById);

// İstifadəçinin öz məhsulları
router.get('/my/products', authMiddleware, getMyProducts);

// Redaktə və 🗑 Silmək
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
