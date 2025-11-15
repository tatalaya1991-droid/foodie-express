// FoodItem.js
import React, { useState } from "react";
import { useCart } from "./CartContext";

export default function FoodItem({ item }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const inc = () => setQty(q => q + 1);
  const dec = () => setQty(q => (q > 1 ? q - 1 : 1));

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQty(value);
    } else if (e.target.value === "") {
      setQty("");
    }
  };

  const handleAdd = () => {
    const quantity = qty === "" ? 1 : qty;
    addToCart(item, quantity);
    setQty(1); // reset hiển thị nếu muốn
  };

  return (
    <div className="card food-item" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img
        src={item.image || "https://via.placeholder.com/200x150?text=No+Image"}
        alt={item.name}
        style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }}
      />
      <h3 style={{ margin: "12px 0 6px" }}>{item.name}</h3>
      <p style={{ color: "#e91e63", fontWeight: "700", margin: 0 }}>{item.price.toLocaleString()}₫</p>
      <p style={{ color: "#777", marginTop: 6 }}>{item.category}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button onClick={dec} style={quantityBtnStyle}>-</button>
        <input
          type="number"
          value={qty}
          onChange={handleChange}
          style={inputStyle}
          min={1}
        />
        <button onClick={inc} style={quantityBtnStyle}>+</button>
      </div>

      <button onClick={handleAdd} style={addBtnStyle}>
        🛒 Thêm vào giỏ
      </button>
    </div>
  );
}

// styles inline để copy nhanh
const quantityBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#f2f2f2",
  cursor: "pointer",
  fontSize: 18,
};

const inputStyle = {
  width: 50,
  textAlign: "center",
  fontWeight: 600,
  border: "1px solid #ddd",
  borderRadius: 8,
  height: 36,
};

const addBtnStyle = {
  marginTop: 12,
  width: "100%",
  padding: "10px 12px",
  background: "#28a745",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600
};
