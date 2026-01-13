// src/FoodDetailPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFoodById } from "./api";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoritesContext";

export default function FoodDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [food, setFood] = useState(null);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState("M");
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getFoodById(id);
        if (alive) setFood(data);
      } catch (e) {
        console.error(e);
        if (alive) setFood(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const fav = isFavorite(id);
  const fmt = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " đ";

  const desc = useMemo(() => {
    const d = food?.description || food?.desc;
    if (d) return d;
    return "Món ăn ngon – nóng hổi – giao nhanh (demo ShopeeFood).";
  }, [food]);

  const addonOptions = useMemo(() => {
    // demo topping giống ShopeeFood (không cần backend)
    const name = String(food?.name || "").toLowerCase();
    const common = [
      { name: "Thêm trứng", price: 7000 },
      { name: "Thêm phô mai", price: 9000 },
      { name: "Thêm xúc xích", price: 10000 },
      { name: "Thêm topping đặc biệt", price: 12000 },
    ];
    if (name.includes("trà") || name.includes("sữa") || name.includes("coffee") || name.includes("cà phê")) {
      return [
        { name: "Thêm trân châu", price: 8000 },
        { name: "Thêm pudding", price: 9000 },
        { name: "Thêm thạch", price: 7000 },
        { name: "Ít đường", price: 0 },
        { name: "Ít đá", price: 0 },
      ];
    }
    return common;
  }, [food]);

  const onToggleAddon = (opt) => {
    setAddons((prev) => {
      const key = String(opt?.name || "");
      if (!key) return prev;
      const exist = prev.find((a) => a.name === key);
      if (exist) return prev.filter((a) => a.name !== key);
      return [...prev, { name: key, price: Number(opt?.price || 0) }];
    });
  };

  const unitPrice = useMemo(() => {
    const base = Number(food?.price || 0);
    const addonTotal = (addons || []).reduce((s, a) => s + Number(a?.price || 0), 0);
    const variantDelta = variant === "L" ? 8000 : variant === "S" ? -3000 : 0;
    return Math.max(0, base + addonTotal + variantDelta);
  }, [food, addons, variant]);

  if (loading) {
    return (
      <div className="fe-container">
        <div className="fe-summaryCard">Đang tải chi tiết món…</div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="fe-container">
        <div className="fe-summaryCard">
          Không tìm thấy món. <Link to="/">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fe-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <Link to="/" className="fe-pill">
          ← Trang chủ
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="fe-pill" onClick={() => toggleFavorite(id)}>
            {fav ? "❤ Đã thích" : "♡ Yêu thích"}
          </button>
          <Link className="fe-pill primary" to="/cart">
            🛒 Giỏ hàng
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, marginTop: 14 }}>
        <div className="fe-summaryCard" style={{ padding: 0, overflow: "hidden" }}>
          {food?.image ? (
            <img src={food.image} alt={food.name} style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, background: "#f5f5f5" }}>🍜</div>
          )}
        </div>

        <div className="fe-summaryCard">
          <div style={{ fontWeight: 900, fontSize: 22 }}>{food?.name || "Món ăn"}</div>
          <div style={{ marginTop: 6, color: "#667085" }}>⭐ {food?.rating || "4.6"} • 20-30 phút • Đánh giá (demo)</div>

          <div style={{ marginTop: 12, fontWeight: 900, fontSize: 20 }}>{fmt(unitPrice)} / phần</div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Size</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { k: "S", label: "S (-3k)" },
                  { k: "M", label: "M" },
                  { k: "L", label: "L (+8k)" },
                ].map((s) => (
                  <button key={s.k} className={`fe-pill ${variant === s.k ? "primary" : ""}`} onClick={() => setVariant(s.k)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Topping (demo)</div>
              <div style={{ display: "grid", gap: 6 }}>
                {addonOptions.map((opt) => {
                  const checked = addons.some((a) => a.name === opt.name);
                  return (
                    <label key={opt.name} style={{ display: "flex", alignItems: "center", gap: 8, color: "#344054", fontSize: 13 }}>
                      <input type="checkbox" checked={checked} onChange={() => onToggleAddon(opt)} />
                      <span style={{ flex: 1 }}>{opt.name}</span>
                      <b>{opt.price ? `+${fmt(opt.price)}` : ""}</b>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, color: "#444", lineHeight: 1.55 }}>{desc}</div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="fe-pill" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <input
                className="fe-input"
                style={{ width: 90, textAlign: "center" }}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10) || 1))}
              />
              <button className="fe-pill" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>

            <button className="fe-btn fe-btn-primary" style={{ flex: 1 }} onClick={() => addToCart(food, qty, { variant, addons })}>
              Thêm vào giỏ
            </button>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee", color: "#667085", fontSize: 13 }}>
            Tip: Bạn có thể áp mã giảm giá ở trang giỏ hàng 🎟️
          </div>
        </div>
      </div>
    </div>
  );
}
