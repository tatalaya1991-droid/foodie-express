// server.js
require("dotenv").config();

const express = require("express");
const http = require('http');
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');

const app = express();
const httpServer = http.createServer(app);

// ✅ Fallback env để tránh crash khi quên cấu hình
// Lưu ý: chỉ dùng local/dev. Production bắt buộc set JWT_SECRET.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev_jwt_secret_change_me";
  console.warn(
    "⚠️ JWT_SECRET chưa được set. Đang dùng fallback dev_jwt_secret_change_me (chỉ nên dùng local/dev)"
  );
}

// ===== Import routes =====
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const foodRoutes = require("./routes/foods");
const paymentRoutes = require("./routes/payment");
const promotionsRoutes = require("./routes/promotions");
const notificationsRoutes = require("./routes/notifications");
const favoritesRoutes = require("./routes/favorites");
const addressesRoutes = require("./routes/addresses");
const conversationsRoutes = require('./routes/conversations');

// ===== Middlewares =====
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);

// Rate limit (nhẹ)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 600,
  })
);

// ===== Routes =====
app.get("/", (req, res) => res.json({ ok: true, name: "FoodieExpress API" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/addresses", addressesRoutes);
app.use('/api/conversations', conversationsRoutes);

// ===== Socket.io (Realtime) =====
// Rooms:
// - user:<userId>
// - role:admin | role:support
// - conv:<conversationId>
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || '').replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) return next(new Error('NO_TOKEN'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('USER_NOT_FOUND'));

    socket.user = user;
    next();
  } catch (e) {
    next(new Error('INVALID_TOKEN'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;
  socket.join(`user:${user._id.toString()}`);
  socket.join(`role:${user.role || 'customer'}`);

  socket.on('conv:join', (conversationId) => {
    if (conversationId) socket.join(`conv:${conversationId}`);
  });

  // Customer send message
  socket.on('chat:send', async (payload, cb) => {
    try {
      const { conversationId, text } = payload || {};
      const Conversations = require('./models/Conversation');
      const Messages = require('./models/Message');

      if (!String(text || '').trim()) return cb?.({ ok: false, message: 'Empty message' });

      let conv = null;
      if (conversationId) conv = await Conversations.findById(conversationId);

      // If customer starts chat and no conv yet -> create
      if (!conv) {
        conv = await Conversations.create({
          customerId: user._id,
          assignedTo: null,
          status: 'open',
          lastMessageAt: new Date(),
          unreadBySupport: 1,
          unreadByCustomer: 0,
        });
      }

      // Auto-assign: first support/admin replying later can claim.
      const msg = await Messages.create({
        conversationId: conv._id,
        senderRole: user.role || 'customer',
        senderId: user._id,
        text: String(text),
      });

      conv.lastMessageAt = new Date();
      if ((user.role || 'customer') === 'customer') {
        conv.unreadBySupport = (conv.unreadBySupport || 0) + 1;
      } else {
        conv.unreadByCustomer = (conv.unreadByCustomer || 0) + 1;
        // if support replies and conv not assigned -> assign to this support
        if (!conv.assignedTo) conv.assignedTo = user._id;
      }
      await conv.save();

      const msgDto = {
        _id: msg._id,
        conversationId: conv._id,
        senderRole: msg.senderRole,
        senderId: msg.senderId,
        text: msg.text,
        createdAt: msg.createdAt,
      };

      // Emit to participants
      io.to(`conv:${conv._id.toString()}`).emit('chat:message', msgDto);
      io.to(`user:${conv.customerId.toString()}`).emit('chat:message', msgDto);

      // Notify support/admin inbox
      io.to('role:support').emit('chat:inbox_update', { conversationId: conv._id, lastMessageAt: conv.lastMessageAt });
      io.to('role:admin').emit('chat:inbox_update', { conversationId: conv._id, lastMessageAt: conv.lastMessageAt });

      cb?.({ ok: true, conversationId: conv._id, message: msgDto });
    } catch (e) {
      console.error('chat:send error', e);
      cb?.({ ok: false, message: 'Server error' });
    }
  });
});

// Expose io for routes
app.set('io', io);

// ===== Start =====
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/foodsdb";
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");

    httpServer.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server start error:", err);
    process.exit(1);
  }
}

start();
