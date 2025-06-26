// controllers/categoryController.js
const Category = require('../models/Category');

// ✅ Yeni kateqoriya (yalnız admin)
exports.createCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Yalnız admin əlavə edə bilər' });
    }
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    console.error('Category creation error:', err);
    res.status(500).json({ error: 'Kateqoriya əlavə olunmadı' });
  }
};

// ✅ Bütün kateqoriyalar
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Kateqoriyalar alınmadı' });
  }
};

// ✅ Kateqoriya silmək
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Kateqoriya silindi' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Kateqoriya silinmədi' });
  }
};

// ✅ Kateqoriya redaktə etmək
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await Category.findByIdAndUpdate(id, { name }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Kateqoriya güncəllənmədi' });
  }
};
