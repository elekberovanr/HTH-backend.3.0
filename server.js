require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');
const categoryRoutes = require('./routes/category');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const favoriteRoutes = require('./routes/favorite');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5555;

// ✅ SOCKET.IO QURULUM
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// ✅ SOCKET.IO ƏMƏLİYYATLARI
io.on('connection', (socket) => {
  console.log('🔌 Yeni bağlantı:', socket.id);

  socket.on('joinRoom', (chatId) => {
    socket.join(chatId);
  });

  socket.on('sendMessage', (message) => {
    socket.to(message.chat).emit('newMessage', message); 
  });

  socket.on('deleteMessage', ({ msgId, chatId }) => {
    io.to(chatId).emit('messageDeleted', msgId);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Bağlantı qopdu:', socket.id);
  });

  socket.on('typing', (chatId) => {
    socket.to(chatId).emit('typing', chatId);
  });

  socket.on('stopTyping', (chatId) => {
    socket.to(chatId).emit('stopTyping', chatId);
  });

});


module.exports.io = io;

// ✅ MIDDLEWARE
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB bağlantısı quruldu');
  server.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda işə düşdü`);
  });
}).catch((err) => {
  console.error('❌ Mongo bağlantı xətası:', err);
});
