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

router.put('/:id', authMiddleware, upload.single('image'), updateProduct);

// Bütün məhsullar
router.get('/', getProducts);



// İstifadəçinin öz məhsulları
router.get('/my/products', authMiddleware, getMyProducts);

router.get('/:id', getProductById);

// Redaktə və 🗑 Silmək
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
