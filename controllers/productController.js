const Product = require('../models/Product');

// ADD
exports.addProduct = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = await Product.create({
      title,
      description,
      category,
      image,
      user: req.userId, // düz sahə adı
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Product creation failed' });
  }
};

// GET
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Məhsullar alınmadı' });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (!product.user || product.user._id?.toString() !== req.userId?.toString()) {
      return res.status(403).json({ error: 'Silməyə icazə yoxdur' });
    }


    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Product delete failed' });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Redaktəyə icazə yoxdur' });
    }

    product.title = title;
    product.description = description;
    product.category = category;
    if (image) product.image = image;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Product update failed' });
  }
};


// 🔍 Məhsul detalları (ID ilə)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', 'username email');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// 👤 İstifadəçinin öz məhsulları
exports.getMyProducts = async (req, res) => {
  try {
    const myProducts = await Product.find({ user: req.userId });
    res.json(myProducts);
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({ error: 'Failed to fetch my products' });
  }
};




