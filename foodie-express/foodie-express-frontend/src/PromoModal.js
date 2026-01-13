import React from "react";
import { toast } from "react-toastify";

export default function PromoModal({ open, promo, onClose }) {
  if (!open || !promo) return null;

  const copyCode = async () => {
    try {
      if (promo.code) {
        await navigator.clipboard.writeText(promo.code);
        toast.success(`Đã copy mã: ${promo.code}`);
      }
    } catch {
      toast.info("Không copy được – bạn có thể tự copy thủ công.");
    }
  };

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={head}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{promo.title}</div>
            <div style={{ color: "#666" }}>{promo.subtitle}</div>
          </div>
          <button style={iconBtn} onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={box}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Mã giảm giá</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={code}>{promo.code || "(không có)"}</span>
              <button style={btn} onClick={copyCode} disabled={!promo.code}>
                Copy mã
              </button>
            </div>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Thời gian</div>
            <div style={{ color: "#444" }}>
              {new Date(promo.start).toLocaleString("vi-VN")} → {new Date(promo.end).toLocaleString("vi-VN")}
            </div>
          </div>

          {Array.isArray(promo.rules) && promo.rules.length > 0 && (
            <div style={box}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Điều kiện</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
                {promo.rules.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 14,
};

const modal = {
  width: "min(560px, 96vw)",
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const head = {
  padding: 16,
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(90deg, #ffedd5, #ecfeff)",
};

const box = {
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
};

const code = {
  display: "inline-block",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px dashed rgba(0,0,0,0.25)",
  background: "#fff7ed",
  fontWeight: 900,
  letterSpacing: 0.5,
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 800,
};

const iconBtn = {
  width: 36,
  height: 36,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#fff",
  cursor: "pointer",
};
