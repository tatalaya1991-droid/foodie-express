// ===== Nạp các thư viện =====
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ===== Import routes =====
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const foodRoutes = require("./routes/foods"); // ✅ route món ăn
const paymentRoutes = require("./routes/payment"); // 💳 Stripe thanh toán

// ===== Khởi tạo app =====
const app = express();

// ===== Middleware =====
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// ===== Cấu hình CORS =====
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);

// ===== Giới hạn request =====
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 100, // tối đa 100 request mỗi phút
  message: "⚠️ Quá nhiều request, vui lòng thử lại sau.",
});
app.use(limiter);

// ===== Routes =====
app.get("/", (req, res) => res.json({ message: "🚀 Server đang hoạt động ổn định!" }));
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/payment", paymentRoutes); // 💳 Stripe payment

// ===== Middleware xử lý lỗi =====
app.use((err, req, res, next) => {
  console.error("❌ Lỗi:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi server nội bộ",
  });
});

// ===== Kết nối MongoDB và khởi động server =====
const start = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/foodsdb";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Kết nối MongoDB thành công!");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server đang chạy tại cổng ${PORT}`)
    );

    // Khi tắt server
    const shutdown = async () => {
      console.log("🛑 Đang tắt server...");
      await mongoose.disconnect();
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Không thể khởi động server:", err);
    process.exit(1);
  }
};

start();
