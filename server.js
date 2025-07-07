require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const supportUsers = require('./supportUsers');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5555;

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});
exports.io = io;

//////////////////////////////
// ✅ 1. SUPPORT SOCKET
//////////////////////////////
const supportNamespace = io.of('/support');

supportNamespace.on('connection', (socket) => {
  console.log('📞 Yeni support bağlantısı:', socket.id);

  socket.on('registerSupportUser', (userId) => {
    supportUsers[userId] = socket.id;
    console.log(`🔗 user ${userId} qoşuldu (support socket)`);
  });

  socket.on('newMessage', (message) => {
    socket.broadcast.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ Support bağlantısı qopdu:', socket.id);
    for (const [userId, socketId] of Object.entries(supportUsers)) {
      if (socketId === socket.id) {
        delete supportUsers[userId];
        break;
      }
    }
  });
});

//////////////////////////////
// ✅ 2. COMMENT SOCKET
//////////////////////////////
const commentNamespace = io.of('/comments');

commentNamespace.on('connection', (socket) => {
  console.log('💬 Comment socket qoşuldu:', socket.id);

  socket.on('newComment', (data) => {
    socket.broadcast.emit('newComment', data);
  });

  socket.on('deleteComment', (id) => {
    socket.emit('deleteComment', id);
    socket.broadcast.emit('deleteComment', id);
  });

  socket.on('disconnect', () => {
    console.log('💬 Comment socket ayrıldı');
  });
});

//////////////////////////////
// ✅ 3. CHAT SOCKET
//////////////////////////////
io.on('connection', (socket) => {
  console.log('🔌 Yeni ümumi socket bağlantısı:', socket.id);

  socket.on('joinRoom', (chatId) => {
    socket.join(chatId);
    console.log(`🟢 Chat otağına qoşuldu: ${chatId}`);
  });

  socket.on('deleteMessage', ({ msgId, chatId }) => {
    io.to(chatId).emit('messageDeleted', msgId);
  });

  socket.on('typing', (chatId) => {
    socket.to(chatId).emit('typing', chatId);
  });

  socket.on('stopTyping', (chatId) => {
    socket.to(chatId).emit('stopTyping', chatId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Chat socket bağlantısı qopdu:', socket.id);
  });
});

//////////////////////////////
// ✅ MIDDLEWARE
//////////////////////////////
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178'
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

//////////////////////////////
// ✅ ROUTES
//////////////////////////////
const authRoutes = require('./routes/auth.js');
const productRoutes = require('./routes/products.js');
const chatRoutes = require('./routes/chat.js');
const categoryRoutes = require('./routes/category.js');
const userRoutes = require('./routes/user.js');
const adminRoutes = require('./routes/admin.js');
const favoriteRoutes = require('./routes/favorite.js');
const supportRoutes = require('./routes/support.js');
const commentRoutes = require('./routes/comment.js');
const donationRoutes = require('./routes/donation.js');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes); 

//////////////////////////////
// ✅ MONGODB CONNECTION
//////////////////////////////
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB bağlantısı uğurludur');
  server.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda işləyir`);
  });
}).catch((err) => {
  console.error('❌ Mongo bağlantı xətası:', err);
});
