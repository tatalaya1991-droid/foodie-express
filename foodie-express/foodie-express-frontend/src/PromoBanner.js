import React from "react";

export default function PromoBanner({ promo, onOpen }) {
  if (!promo) return null;

  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900 }}>{promo.title}</div>
        <div style={{ opacity: 0.95 }}>{promo.subtitle}</div>
        {promo.code && (
          <span style={code}>Mã: {promo.code}</span>
        )}
      </div>

      <button style={btn} onClick={onOpen}>
        Xem chi tiết
      </button>
    </div>
  );
}

const wrap = {
  marginBottom: 12,
  padding: "10px 14px",
  borderRadius: 16,
  background: "linear-gradient(90deg, #ffedd5, #ecfeff)",
  border: "1px solid rgba(0,0,0,0.06)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const code = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.8)",
  border: "1px dashed rgba(0,0,0,0.2)",
  fontWeight: 900,
};

const btn = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 800,
};
