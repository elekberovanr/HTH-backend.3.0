const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById,
  getMyProducts,
  getProductsByUser,
  getProductsByCategory,
  getLatestProducts
} = require('../controllers/productController');

// 🔼 Yeni məhsul əlavə et 
router.post('/', verifyToken, upload.array('image', 10), addProduct);

// ✏️ Redaktə et 
router.put('/:id', verifyToken, upload.array('images', 10), updateProduct);

// 📥 Bütün məhsullar
router.get('/', getProducts);

router.get('/latest', getLatestProducts);

// 👤 Öz məhsullarım
router.get('/my/products', verifyToken, getMyProducts);
router.get('/my', verifyToken, getMyProducts); 

// 👤 İstifadəçiyə aid məhsullar
router.get('/user/:userId', getProductsByUser);

router.get('/products/my', verifyToken, getMyProducts);

// 🔍 Tək məhsul detayı
router.get('/:id', getProductById);

// 🗑 Məhsulu sil
router.delete('/:id', verifyToken, deleteProduct);

router.get('/category/:category', getProductsByCategory);

module.exports = router;
