const Product = require('../models/Product');
exports.addProduct = async (req, res) => {
    try {
        const { title, description } = req.body;
        const image = req.file ? req.file.filename : null;

        const product = await Product.create({
            title,
            description,
            image,
            owner: req.userId
        });

        res.status(201).json(product);
    } catch (err) {
        console.error('Product creation error:', err);
        res.status(500).json({ error: 'Product creation failed' });
    }
};


exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('owner', 'username email');
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Could not fetch products' });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Yalnız məhsulun sahibi silə bilər
        if (product.owner.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Product delete failed' });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.owner.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { title, description } = req.body;
        product.title = title || product.title;
        product.description = description || product.description;

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
      const product = await Product.findById(req.params.id).populate('owner', 'username email');
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
      const myProducts = await Product.find({ owner: req.userId });
      res.json(myProducts);
    } catch (err) {
      console.error('Get my products error:', err);
      res.status(500).json({ error: 'Failed to fetch my products' });
    }
  };
  



