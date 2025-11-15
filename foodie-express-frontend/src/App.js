// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { getFoods } from "./api";
import "./App.css";
import FoodItem from "./FoodItem";
import CartPage from "./CartPage";
import PaymentResultPage from "./PaymentResultPage";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { ToastContainer } from "react-toastify";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function HomePage() {
  const [foods, setFoods] = useState([]);
  const [filter, setFilter] = useState("Tất cả");
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { cart } = useCart();
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFoods();
        setFoods(data || []);
      } catch (err) {
        console.error("Không thể tải danh sách món ăn:", err);
      }
    }
    fetchData();
  }, []);

  const categories = ["Tất cả", ...new Set(foods.map((f) => f.category || "Khác"))];
  const filtered = filter === "Tất cả" ? foods : foods.filter((f) => f.category === filter);

  const handleAuthSuccess = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={1800} />

      {/* ===== HEADER ===== */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          padding: "12px 20px",
          borderRadius: 10,
          marginBottom: 15,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, cursor: "pointer" }} onClick={() => navigate("/")}>
          🍽️ Foodie Express
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!user ? (
            <>
              <button style={btnAuth} onClick={() => setShowLogin(true)}>
                🔐 Đăng nhập
              </button>
              <button style={btnPrimary} onClick={() => setShowRegister(true)}>
                📝 Đăng ký
              </button>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600 }}>👋 {user.name || user.email}</span>
              <button style={btnLogout} onClick={logout}>
                🚪 Đăng xuất
              </button>
            </>
          )}

          <button style={btnCart} onClick={() => setShowCart((s) => !s)}>
            {showCart ? "⬅️ Quay lại" : `🛒 Giỏ (${cart.length})`}
          </button>
        </div>
      </header>

      {/* ===== LOGIN / REGISTER ===== */}
      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSwitch={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showRegister && (
        <RegisterPage
          onClose={() => setShowRegister(false)}
          onSwitch={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      {!showCart && !showLogin && !showRegister && (
        <>
          <div style={{ margin: "12px 0" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  marginRight: 8,
                  padding: "8px 12px",
                  borderRadius: 20,
                  background: filter === cat ? "#ff9800" : "#eee",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid">
            {filtered.map((food) => (
              <div key={food._id} style={{ width: "100%" }}>
                <FoodItem item={food} />
              </div>
            ))}
          </div>
        </>
      )}

      {showCart && !showLogin && !showRegister && <CartPage />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
      </Routes>
    </Router>
  );
}

const btnPrimary = {
  background: "#007bff",
  border: "none",
  color: "white",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};

const btnAuth = {
  background: "#f1f1f1",
  border: "1px solid #ddd",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};

const btnLogout = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};

const btnCart = {
  background: "#28a745",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
