// src/FoodItem.js
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoritesContext";

export default function FoodItem({ food }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const id = food?._id || food?.id;
  const fav = isFavorite(id);

  const fmt = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " đ";

  return (
    <div className="fe-card">
      <div className="fe-card-imgWrap">
        <Link to={`/food/${id}`} title="Xem chi tiết" className="fe-card-imgLink">
          {food?.image ? (
            <img src={food.image} alt={food.name} className="fe-card-img" />
          ) : (
            <div className="fe-card-img fe-card-imgPlaceholder">🍜</div>
          )}
        </Link>

        <button
          className={`fe-favBtn ${fav ? "active" : ""}`}
          onClick={() => toggleFavorite(id)}
          title={fav ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          {fav ? "❤" : "♡"}
        </button>
      </div>

      <div className="fe-card-body">
        <div className="fe-card-title">
          <Link to={`/food/${id}`} className="fe-link">
            {food?.name || "Món ăn"}
          </Link>
        </div>

        <div className="fe-card-meta">
          <span className="fe-price">{fmt(food?.price)}</span>
          <span className="fe-rating">⭐ {food?.rating || "4.6"}</span>
        </div>

        <div className="fe-card-actions">
          <button className="fe-btn fe-btn-primary" onClick={() => addToCart(food, 1)}>
            + Thêm
          </button>
          <Link className="fe-btn fe-btn-ghost" to={`/food/${id}`}>
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
