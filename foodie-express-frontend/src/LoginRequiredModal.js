// src/LoginRequiredModal.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRequiredModal({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  const goLogin = () => {
    onClose?.();
    navigate("/login");
  };

  const goRegister = () => {
    onClose?.();
    navigate("/register");
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>Vui lòng đăng nhập trước</div>
        <div style={styles.desc}>
          Bạn cần đăng nhập/đăng ký để mua hàng và đặt đơn.
        </div>

        <button style={styles.btn} onClick={goLogin}>
          Đăng nhập
        </button>

        <div style={styles.small}>
          Chưa có tài khoản?{" "}
          <button style={styles.linkBtn} onClick={goRegister}>
            Đăng ký ngay
          </button>
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    textAlign: "center",
  },
  title: { fontSize: 20, fontWeight: 800, marginBottom: 8 },
  desc: { fontSize: 14, color: "#555", marginBottom: 14, lineHeight: 1.4 },
  btn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#198754",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
  },
  small: { marginTop: 12, fontSize: 13 },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "#0d6efd",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  closeBtn: {
    marginTop: 12,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};
