// src/BannerSlider.js
import React, { useEffect, useMemo, useState } from "react";

export default function BannerSlider({ promos = [] }) {
  const slides = useMemo(() => {
    const actives = (promos || []).filter((p) => p.active);
    return actives.length ? actives : (promos || []);
  }, [promos]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;

  const p = slides[idx];

  return (
    <div className="fe-slider">
      <div
        className="fe-slide"
        style={{
          backgroundImage: `url(${p.bannerImage || "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1400&q=80"})`,
        }}
      >
        <div className="fe-slideTitle">
          <b>{p.title}</b>
          <span>{p.subtitle}</span>
          <span style={{ marginTop: 6 }}>
            Mã: <b style={{ display: "inline" }}>{p.code}</b> • {p.type === "amount" ? `Giảm ${Number(p.value || 0).toLocaleString("vi-VN")}đ` : `Giảm ${p.value}%`}
          </span>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="fe-slider-controls">
          <button className="fe-circle" onClick={() => setIdx((v) => (v - 1 + slides.length) % slides.length)} aria-label="Prev">
            ‹
          </button>
          <button className="fe-circle" onClick={() => setIdx((v) => (v + 1) % slides.length)} aria-label="Next">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
