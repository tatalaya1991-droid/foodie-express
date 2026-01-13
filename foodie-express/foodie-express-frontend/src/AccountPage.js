// src/AccountPage.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AddressBook from "./AddressBook";
import OrderHistory from "./OrderHistory";

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <div className="fe-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>👤 Tài khoản</div>
          <div style={{ color: "#667085", marginTop: 4 }}>
            {user?.name || user?.email || "User"} • {user?.email || ""}
            {user?.role ? ` • role: ${user.role}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link className="fe-pill" to="/">
            ← Trang chủ
          </Link>
          <Link className="fe-pill primary" to="/cart">
            🛒 Giỏ hàng
          </Link>
          {user && (user.role === 'support' || user.role === 'admin') ? (
            <Link className="fe-pill" to="/staff">
              🛠 Staff Panel
            </Link>
          ) : null}
          <button className="fe-pill" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 14 }}>
        <AddressBook />
        <OrderHistory />
      </div>
    </div>
  );
}
