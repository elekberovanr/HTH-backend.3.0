const Favorite = require('../models/Favorite');

// 🔍 Favoritləri al
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId }).populate('product');

    // Null olan product-ları filter et
    const validFavorites = favorites.filter(fav => fav.product !== null);

    res.json(validFavorites);
  } catch (err) {
    res.status(500).json({ error: 'Favoritlər alınmadı' });
  }
};


// ➕ Favoritə əlavə et
exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Favorite.findOne({ user: req.userId, product: productId });

    if (existing) {
      return res.status(400).json({ message: 'Artıq favoritdə var' });
    }

    const fav = await Favorite.create({ user: req.userId, product: productId });
    res.status(201).json({ message: 'Favoritə əlavə olundu', data: fav });
  } catch (err) {
    res.status(500).json({ message: 'Əlavə edilə bilmədi', error: err.message });
  }
};

// ❌ Favoritdən sil
exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const removed = await Favorite.findOneAndDelete({ user: req.userId, product: productId });

    if (!removed) {
      return res.status(404).json({ message: 'Favorit tapılmadı' });
    }

    res.json({ message: 'Favoritdən silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Silinmədi', error: err.message });
  }
};
