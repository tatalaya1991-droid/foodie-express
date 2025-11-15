const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==================== 💳 API THANH TOÁN QUA STRIPE ====================
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // ⚠️ Stripe không hỗ trợ VND -> đổi sang USD (tỷ giá tạm 1 USD = 25,000 VND)
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [
            item.image && item.image.startsWith("http")
              ? item.image
              : "https://via.placeholder.com/150",
          ],
        },
        unit_amount: Math.round((item.price / 25000) * 100), // cent USD
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Lỗi tạo session Stripe:", err.message);
    res.status(500).json({ message: "Lỗi khi tạo session thanh toán" });
  }
});

// ==================== 📱 API TẠO MÃ QR THANH TOÁN ====================
router.post("/create-qr", async (req, res) => {
  try {
    const {
      amount,
      accountNumber = "9704220001234567890", // 👉 thay bằng STK thật của bạn
      accountName = "FOODIE EXPRESS",
      bankCode = "VCB", // mã ngân hàng: VCB, ACB, BIDV, MBB, TCB, v.v.
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    // tạo nội dung chuyển khoản tự động
    const addInfo = encodeURIComponent(`Thanh toan don hang FoodieExpress ${Date.now()}`);

    // tạo link QR VietQR (ảnh PNG)
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-qr_only.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(accountName)}`;

    res.json({ qrUrl });
  } catch (error) {
    console.error("❌ Lỗi tạo QR:", error);
    res.status(500).json({ message: "Lỗi khi tạo mã QR" });
  }
});

module.exports = router;
