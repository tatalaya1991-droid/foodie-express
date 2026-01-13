// src/PaymentResultPage.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PaymentResultPage() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const status = params.get("status") || "success";

  const ok = status === "success";

  return (
    <div className="fe-container">
      <div className="fe-summaryCard">
        <div style={{ fontWeight: 900, fontSize: 22 }}>{ok ? "✅ Thanh toán thành công" : "❌ Thanh toán thất bại"}</div>
        <div style={{ color: "#667085", marginTop: 6 }}>
          {ok ? "Cảm ơn bạn! Đơn hàng của bạn đang được xử lý (demo)." : "Vui lòng thử lại hoặc chọn phương thức khác."}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link className="fe-pill primary" to="/">
            Về trang chủ
          </Link>
          <Link className="fe-pill" to="/cart">
            Xem giỏ hàng
          </Link>
          <Link className="fe-pill" to="/account">
            Tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
