require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/Chat');
const paymentRoutes = require('./routes/Payment');
const categoryRoutes = require('./routes/Category');
const userRoutes = require('./routes/User');

const app = express();

// ✅ CORS düzəlişi (portlara görə)
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5175', 'http://localhost:5176', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Fayl göstərmək üçün (şəkillər)
app.use('/uploads', express.static('uploads'));

// ✅ JSON oxumaq üçün
app.use(express.json());

// ✅ Router-lar
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Mongo bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo error:', err));

// ✅ Serveri başlat
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
