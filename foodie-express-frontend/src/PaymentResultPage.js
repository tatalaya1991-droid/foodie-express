// PaymentResultPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentResultPage() {
  const [status, setStatus] = useState("loading");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success) setStatus("success");
    else if (canceled) setStatus("canceled");
    else setStatus("unknown");
  }, [searchParams]);

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div style={containerStyle}>
      {status === "loading" && <h2>⏳ Đang xử lý thanh toán...</h2>}
      {status === "success" && (
        <>
          <h2 style={{ color: "green" }}>✅ Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt hàng tại <strong>Foodie Express</strong> 🍽️</p>
          <button onClick={handleBackHome} style={btnStyle}>Về trang chủ</button>
        </>
      )}
      {status === "canceled" && (
        <>
          <h2 style={{ color: "red" }}>❌ Thanh toán bị hủy</h2>
          <p>Bạn có thể thử lại hoặc chọn phương thức khác.</p>
          <button onClick={handleBackHome} style={btnStyle}>Quay lại menu</button>
        </>
      )}
      {status === "unknown" && (
        <>
          <h2>⚠️ Không xác định trạng thái thanh toán</h2>
          <button onClick={handleBackHome} style={btnStyle}>Quay lại</button>
        </>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: 500,
  margin: "80px auto",
  padding: 20,
  textAlign: "center",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const btnStyle = {
  marginTop: 20,
  padding: "10px 18px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};
