require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/Chat');
const paymentRoutes = require('./routes/Payment');
const categoryRoutes = require('./routes/Category');
const userRoutes = require('./routes/User');

const app = express();
const server = http.createServer(app);

// ✅ PORT
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
    io.to(message.chat).emit('newMessage', message);
  });

  socket.on('deleteMessage', ({ msgId, chatId }) => {
    io.to(chatId).emit('messageDeleted', msgId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Bağlantı qopdu:', socket.id);
  });
});

// 🌍 Export IO (əgər route-larda istifadə etmək istəsən)
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
app.use('/uploads', express.static('uploads'));

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB bağlantısı quruldu'))
  .catch((err) => console.error('❌ Mongo səhvi:', err));

// ✅ Serveri başladırıq — YALNIZ server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda işə düşdü`);
});
