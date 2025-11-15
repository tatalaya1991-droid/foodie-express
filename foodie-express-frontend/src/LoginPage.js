// LoginPage.js
import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, () => window.location.href = "/");
  };

  return (
    <div style={wrapper}>
      <div style={card}>
        <h2>🔐 Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input
            style={input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={input}
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={btn} type="submit">Đăng nhập</button>
        </form>
        <p style={{ marginTop: 12 }}>
          Chưa có tài khoản?{" "}
          <button onClick={onSwitchToRegister} style={link}>Đăng ký ngay</button>
        </p>
      </div>
    </div>
  );
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "linear-gradient(135deg, #f8f9fa, #dfe6e9)",
};
const card = {
  width: 350,
  padding: 30,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  textAlign: "center",
};
const input = {
  width: "100%",
  padding: 10,
  margin: "8px 0",
  borderRadius: 6,
  border: "1px solid #ccc",
};
const btn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "none",
  borderRadius: 8,
  background: "#28a745",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: "bold",
};
const link = {
  background: "none",
  border: "none",
  color: "#007bff",
  cursor: "pointer",
};
