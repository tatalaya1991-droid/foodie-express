// src/FavoritesModal.js
import React, { useMemo } from "react";
import { useFavorites } from "./FavoritesContext";

export default function FavoritesModal({ open, onClose, foods = [], onSelectFood }) {
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();

  const map = useMemo(() => {
    const m = new Map();
    (foods || []).forEach((f) => {
      const id = f?._id || f?.id;
      if (id) m.set(id, f);
    });
    return m;
  }, [foods]);

  if (!open) return null;

  const fmt = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " đ";

  const items = favorites
    .map((id) => map.get(id) || { _id: id, name: "Món yêu thích", price: 0 })
    .filter(Boolean);

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={head}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>❤️ Món yêu thích</div>
            <div style={{ color: "#667085", fontSize: 13 }}>Lưu lại để đặt nhanh hơn</div>
          </div>
          <button style={iconBtn} onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        <div style={{ padding: 14, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ color: "#667085" }}>
            Tổng: <b>{items.length}</b> món
          </div>
          <button style={pillBtn} onClick={clearFavorites} disabled={items.length === 0}>
            Xóa tất cả
          </button>
        </div>

        <div style={list}>
          {items.length === 0 ? (
            <div style={{ padding: 16, color: "#667085" }}>Chưa có món yêu thích nào.</div>
          ) : (
            items.map((f) => {
              const id = f?._id || f?.id;
              return (
                <div key={id} style={row}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                    <div style={thumb}>
                      {f?.image ? (
                        <img alt={f.name} src={f.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ fontSize: 18 }}>🍜</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{f?.name || "Món ăn"}</div>
                      <div style={{ color: "#667085", fontSize: 13 }}>{fmt(f?.price)}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={pillBtn}
                      onClick={() => {
                        onSelectFood?.(f);
                        onClose?.();
                      }}
                    >
                      Xem
                    </button>
                    <button style={dangerBtn} onClick={() => toggleFavorite(id)} title="Bỏ yêu thích">
                      Bỏ ❤
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 16,
};

const modal = {
  width: "min(860px, 96vw)",
  maxHeight: "86vh",
  overflow: "hidden",
  background: "white",
  borderRadius: 16,
  boxShadow: "0 18px 60px rgba(0,0,0,.25)",
  display: "flex",
  flexDirection: "column",
};

const head = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  borderBottom: "1px solid #eee",
};

const iconBtn = {
  border: "1px solid #e6e6e6",
  background: "white",
  borderRadius: 10,
  padding: "8px 10px",
  cursor: "pointer",
};

const list = { overflow: "auto", padding: 14, display: "grid", gap: 10 };

const row = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  border: "1px solid #eef2f6",
  borderRadius: 14,
  padding: 12,
};

const thumb = {
  width: 52,
  height: 52,
  borderRadius: 12,
  background: "#f2f4f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const pillBtn = {
  border: "1px solid #e6e6e6",
  background: "white",
  borderRadius: 999,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const dangerBtn = { ...pillBtn, border: "1px solid #ffd1d1", background: "#fff5f5", color: "#b42318" };
