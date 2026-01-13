// src/OrderHistory.js
import React, { useEffect, useState } from "react";
import { demoAdvanceOrder, getMyOrders } from "./api";
import { useSocket } from './SocketContext';

export default function OrderHistory() {
  const { socket, connected } = useSocket();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Realtime update: when staff updates order status
  useEffect(() => {
    if (!socket || !connected) return;
    const onUpdated = (payload) => {
      // simple approach: reload list
      reload();
    };
    socket.on('order:updated', onUpdated);
    return () => socket.off('order:updated', onUpdated);
    // eslint-disable-next-line
  }, [socket, connected]);

  const fmt = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " đ";

  const statusLabel = (s) => {
    const m = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      delivering: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return m[s] || "Đang xử lý";
  };

  return (
    <div className="fe-summaryCard">
      <div style={{ fontWeight: 900, fontSize: 16 }}>🧾 Lịch sử đơn hàng</div>
      <div style={{ color: "#667085", fontSize: 13, marginTop: 6 }}>Xem lại các đơn bạn đã đặt (demo).</div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {loading ? (
          <div style={{ color: "#667085" }}>Đang tải…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "#667085" }}>Chưa có đơn hàng nào.</div>
        ) : (
          items.map((o) => (
            <div key={o._id} style={{ border: "1px solid #eef2f6", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Đơn #{String(o._id).slice(-6).toUpperCase()}</div>
                  <div style={{ color: "#667085", fontSize: 13, marginTop: 4 }}>
                    {new Date(o.createdAt).toLocaleString("vi-VN")} • {o.orderItems?.length || 0} món
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900 }}>{fmt(o.finalPrice || o.totalPrice)}</div>
                  {o.discountAmount ? <div style={{ color: "#16a34a", fontSize: 13 }}>- {fmt(o.discountAmount)} ({o.promoCode || "KM"})</div> : null}
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="fe-pill" style={{ cursor: "default" }}>
                    📦 {statusLabel(o.status)}
                  </span>
                  <span className="fe-pill" style={{ cursor: "default" }}>
                    🚚 Ship: {fmt(o.shippingFee || 0)}
                  </span>
                  <span className="fe-pill" style={{ cursor: "default" }}>
                    💳 {String(o.paymentMethod || "cod").toUpperCase()}
                  </span>
                </div>

                <button
                  className="fe-pill"
                  onClick={async () => {
                    try {
                      await demoAdvanceOrder(o._id);
                      await reload();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  disabled={o.status === "delivered" || o.status === "cancelled"}
                >
                  ⏭️ Cập nhật trạng thái (demo)
                </button>
              </div>

              {o.shippingAddress?.line1 ? (
                <div style={{ marginTop: 8, color: "#667085", fontSize: 13 }}>
                  📍 {o.shippingAddress.line1}
                  {o.shippingAddress.district ? `, ${o.shippingAddress.district}` : ""}
                  {o.shippingAddress.city ? `, ${o.shippingAddress.city}` : ""}
                </div>
              ) : null}

              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                {(o.orderItems || []).slice(0, 3).map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#111" }}>
                    <span>
                      {it.name} × {it.qty}
                    </span>
                    <span style={{ color: "#667085" }}>{fmt(Number(it.price) * Number(it.qty))}</span>
                  </div>
                ))}
                {(o.orderItems || []).length > 3 ? <div style={{ color: "#667085", fontSize: 13 }}>… và {(o.orderItems || []).length - 3} món khác</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
