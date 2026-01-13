// src/LoginPage.js
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import AuthModalWrapper from "./AuthModalWrapper";

export default function LoginPage({ onClose, onSwitch, onSuccess }) {
  const { login, socialLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      alert(err?.message || "Đăng nhập thất bại");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await socialLogin(idToken);
      onSuccess?.();
    } catch (err) {
      alert("Đăng nhập Google thất bại");
      console.error(err);
    }
  };

  return (
    <AuthModalWrapper>
      <div style={card}>
        {onClose && (
          <button style={closeBtn} onClick={onClose}>✖</button>
        )}

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

        <button style={googleBtn} onClick={handleGoogleLogin}>
          🔵 Đăng nhập bằng Google
        </button>

        <p style={{ marginTop: 14 }}>
          Chưa có tài khoản?{" "}
          <button onClick={onSwitch} style={linkBtn}>
            Đăng ký ngay
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
  background: "#198754",
  color: "#fff",
  fontWeight: "bold",
};

const googleBtn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#fff",
  fontWeight: 700,
};

const linkBtn = {
  border: "none",
  background: "transparent",
  color: "#0d6efd",
  fontWeight: 700,
  cursor: "pointer",
};
