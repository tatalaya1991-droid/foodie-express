// src/RegisterPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, () => nav("/"));
    } catch (err) {
      alert(err?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div style={wrapper}>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>📝 Đăng ký</h2>

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
          <Link to="/login" style={linkA}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "calc(100vh - 0px)",
  background: "linear-gradient(135deg, #f8f9fa, #dfe6e9)",
};
const card = {
  width: 380,
  padding: 28,
  borderRadius: 14,
  background: "#fff",
  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
  textAlign: "center",
};
const input = {
  width: "100%",
  padding: 12,
  margin: "8px 0",
  borderRadius: 10,
  border: "1px solid #ccc",
  outline: "none",
};
const btn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "none",
  borderRadius: 10,
  background: "#0d6efd",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: "bold",
};
const linkA = { color: "#0d6efd", fontWeight: 700, textDecoration: "none" };
