require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Channel = require('./models/Channel');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/messages', require('./routes/messages'));

const seedChannels = async () => {
  const defaults = [
    { name: 'general', description: 'General discussion for everyone' },
    { name: 'random', description: 'Random conversations' },
    { name: 'announcements', description: 'Important announcements' },
    { name: 'help', description: 'Ask for help here' }
  ];
  for (const ch of defaults) {
    await Channel.findOneAndUpdate({ name: ch.name }, ch, { upsert: true, new: true });
  }
  console.log('Default channels ready');
};

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    if (!socket.user) return next(new Error('User not found'));
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`${socket.user.username} connected`);
  onlineUsers.set(socket.user._id.toString(), socket.user.username);
  io.emit('online-users', Array.from(onlineUsers.values()));

  socket.on('join-channel', (channelId) => {
    Array.from(socket.rooms).forEach((room) => {
      if (room !== socket.id) socket.leave(room);
    });
    socket.join(channelId);
  });

  socket.on('send-message', async ({ channelId, content }) => {
    if (!content?.trim()) return;

    try {
      const channel = await Channel.findById(channelId);
      if (!channel) return;

      const message = await Message.create({
        content: content.trim(),
        author: socket.user._id,
        channel: channelId
      });

      const populated = await message.populate('author', 'username avatarColor');

      io.to(channelId).emit('new-message', {
        _id: populated._id,
        content: populated.content,
        author: populated.author,
        channel: channelId,
        createdAt: populated.createdAt
      });
    } catch (err) {
      console.error('Message error:', err.message);
    }
  });

  socket.on('typing', ({ channelId }) => {
    socket.to(channelId).emit('user-typing', { username: socket.user.username });
  });

  socket.on('stop-typing', ({ channelId }) => {
    socket.to(channelId).emit('user-stop-typing', { username: socket.user.username });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.user._id.toString());
    io.emit('online-users', Array.from(onlineUsers.values()));
    console.log(`${socket.user.username} disconnected`);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedChannels();
    server.listen(process.env.PORT, () =>
      console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('DB connection failed:', err));
