// CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const s = localStorage.getItem("cart");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🛒 Thêm món vào giỏ (hỗ trợ số lượng)
  const addToCart = (food, quantity = 1) => {
    let message = "";
    setCart((prev) => {
      const existing = prev.find((p) => p._id === food._id);
      if (existing) {
        message = `Tăng số lượng ${food.name} lên ${existing.quantity + quantity}`;
        return prev.map((p) =>
          p._id === food._id ? { ...p, quantity: p.quantity + quantity } : p
        );
      } else {
        message = `Đã thêm ${food.name} x${quantity} vào giỏ`;
        return [...prev, { ...food, quantity }];
      }
    });
    // Gọi toast sau khi state đã được set
    setTimeout(() => toast.info(message), 50);
  };

  // ➕ Tăng số lượng
  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  };

  // ➖ Giảm số lượng
  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p._id === id && p.quantity > 1
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  // 🔢 Cập nhật số lượng thủ công
  const updateQuantity = (id, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    setCart((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, quantity } : p
      )
    );
  };

  // ❌ Xóa món
  const removeFromCart = (id) => {
    const removed = cart.find((p) => p._id === id);
    setCart((prev) => prev.filter((p) => p._id !== id));
    if (removed) setTimeout(() => toast.warn(`Đã xóa ${removed.name}`), 50);
  };

  // 🧹 Xóa toàn bộ
  const clearCart = () => {
    setCart([]);
    setTimeout(() => toast.info("Đã xóa toàn bộ giỏ hàng"), 50);
  };

  // 💰 Tổng giá
  const getTotalPrice = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
