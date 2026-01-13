// src/RegisterPage.js
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import AuthModalWrapper from "./AuthModalWrapper";

export default function RegisterPage({ onClose, onSwitch, onSuccess }) {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      onSuccess?.();
    } catch (err) {
      alert(err?.message || "Đăng ký thất bại");
    }
  };

  return (
    <AuthModalWrapper>
      <div style={card}>
        {onClose && (
          <button style={closeBtn} onClick={onClose}>✖</button>
        )}

        <h2>📝 Đăng ký</h2>

        <form onSubmit={handleSubmit}>
          <input
            style={input}
            placeholder="Họ tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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

          <button style={btn} type="submit">Tạo tài khoản</button>
        </form>

        <p style={{ marginTop: 14 }}>
          Đã có tài khoản?{" "}
          <button onClick={onSwitch} style={linkBtn}>
            Đăng nhập
          </button>
        </p>
      </div>
    </AuthModalWrapper>
  );
}

const card = {
  position: "relative",
  width: 380,
  padding: 28,
  borderRadius: 14,
  background: "#fff",
  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
  textAlign: "center",
};

const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: 12,
  margin: "8px 0",
  borderRadius: 10,
  border: "1px solid #ccc",
};

const btn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "none",
  borderRadius: 10,
  background: "#0d6efd",
  color: "#fff",
  fontWeight: "bold",
};

const linkBtn = {
  border: "none",
  background: "transparent",
  color: "#0d6efd",
  fontWeight: 700,
  cursor: "pointer",
};
