// src/LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Firebase Google
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export default function LoginPage() {
  const nav = useNavigate();
  const { login, socialLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, () => nav("/"));
    } catch (err) {
      alert(err?.message || "Đăng nhập thất bại");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await socialLogin(idToken, () => nav("/"));
    } catch (err) {
      console.error(err);
      alert("Đăng nhập Google thất bại. Kiểm tra Firebase Auth (Google provider).");
    }
  };

  return (
    <div style={wrapper}>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>🔐 Đăng nhập</h2>

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

        <button style={googleBtn} onClick={handleGoogleLogin}>
          🔵 Đăng nhập bằng Google
        </button>

        <p style={{ marginTop: 14 }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={linkA}>Đăng ký ngay</Link>
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
  background: "#198754",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: "bold",
};
const googleBtn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#fff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 700,
};
const linkA = { color: "#0d6efd", fontWeight: 700, textDecoration: "none" };
