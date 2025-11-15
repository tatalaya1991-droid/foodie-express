import React from "react";
import { useCart } from "./CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

// ⚠️ Thay bằng khóa công khai Stripe của bạn
const stripePromise = loadStripe(
  "pk_test_51SHLLgKFIiIrKZngMb0EPDGbp7fW87YvjXB1TBQ02m4rpyVNv0yzjPtVvvXLj1YRxEFQyrVIiIAfUj8qF3d6OwuY00X2r0EQYn"
);

export default function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
  } = useCart();

  // 💳 Thanh toán bằng Stripe
  const handleCheckout = async () => {
    try {
      if (!cart || cart.length === 0) {
        toast.warning("🛒 Giỏ hàng trống!");
        return;
      }

      const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: cart }),
      });

      if (!res.ok) throw new Error("Không thể tạo phiên thanh toán!");

      const data = await res.json();
      const stripe = await stripePromise;
      clearCart();
      window.location.href = data.url; // Chuyển sang trang thanh toán Stripe
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Lỗi khi khởi tạo thanh toán!");
    }
  };

  // 📱 Thanh toán bằng QR ngân hàng (VietQR)
  const handleQRPayment = async () => {
    try {
      const amount = getTotalPrice();
      if (amount <= 0) {
        toast.warning("🛒 Giỏ hàng trống hoặc số tiền không hợp lệ!");
        return;
      }

      const res = await fetch("http://localhost:5000/api/payment/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (data.qrUrl) {
        window.open(data.qrUrl, "_blank"); // mở ảnh QR ở tab mới
        toast.success("✅ Mã QR đã được tạo! Quét để thanh toán nhé!");
      } else {
        toast.error("⚠️ Không thể tạo mã QR thanh toán!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi khi tạo mã QR!");
    }
  };

  // 🛍️ Nếu giỏ hàng trống
  if (!cart || cart.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h3>🛍️ Giỏ hàng trống</h3>
        <p>Hãy chọn vài món ăn ngon để thưởng thức nhé 😋</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>🛒 Giỏ hàng của bạn</h2>

      <div style={{ marginTop: 12 }}>
        {cart.map((item) => (
          <div
            key={item._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={item.image}
                alt={item.name}
                width="70"
                height="70"
                style={{
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</div>
                <div style={{ color: "#777", fontSize: 14 }}>
                  {item.price.toLocaleString()}₫
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => decreaseQuantity(item._id)} style={btnQty}>
                −
              </button>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item._id, e.target.value)}
                style={{
                  width: 55,
                  textAlign: "center",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "4px 6px",
                }}
              />

              <button onClick={() => increaseQuantity(item._id)} style={btnQty}>
                +
              </button>

              <div style={{ fontWeight: 700, width: 90, textAlign: "right" }}>
                {(item.price * item.quantity).toLocaleString()}₫
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#d32f2f",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3
        style={{
          textAlign: "right",
          marginTop: 20,
          color: "#222",
          fontSize: 20,
        }}
      >
        Tổng cộng:{" "}
        <span style={{ color: "#ff5722" }}>
          {getTotalPrice().toLocaleString()}₫
        </span>
      </h3>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button onClick={clearCart} style={btnClear}>
          🧹 Xóa giỏ hàng
        </button>

        <button onClick={handleCheckout} style={btnStripe}>
          💳 Thanh toán bằng thẻ (Stripe)
        </button>

        <button onClick={handleQRPayment} style={btnQR}>
          📱 Thanh toán QR
        </button>
      </div>
    </div>
  );
}

// ================== CSS INLINE ==================
const btnQty = {
  padding: "4px 10px",
  borderRadius: 4,
  border: "1px solid #ccc",
  background: "#fafafa",
  cursor: "pointer",
};

const btnClear = {
  background: "#f8f8f8",
  border: "1px solid #ccc",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const btnStripe = {
  background: "#007bff",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 6,
  cursor: "pointer",
};

const btnQR = {
  background: "#28a745",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 6,
  cursor: "pointer",
};
