// src/CartContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const LS_CART = "fe_cart_v3";
const LS_PROMO = "fe_cart_promo_v1";

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function stableAddonKey(addons) {
  const list = Array.isArray(addons) ? addons : [];
  return list
    .map((a) => ({ name: String(a?.name || ""), price: Number(a?.price || 0) }))
    .filter((a) => a.name)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"))
    .map((a) => `${a.name}:${a.price}`)
    .join("|");
}

function normalizeItem(food, opts = {}) {
  const productId = food?._id || food?.id;
  const rawBase = Number(food?.price || 0);
  const addons = Array.isArray(opts.addons) ? opts.addons : [];
  const addonsTotal = addons.reduce((s, a) => s + Number(a?.price || 0), 0);
  const variant = String(opts.variant || "M");
  const variantDelta = variant === "L" ? 8000 : variant === "S" ? -3000 : 0;
  const basePrice = Math.max(0, rawBase + variantDelta);
  const key = `${productId}::${variant}::${stableAddonKey(addons)}`;

  return {
    id: key, // key duy nhất trong giỏ (tránh đụng món giống nhau nhưng khác topping)
    productId,
    name: food?.name || food?.title || "Món ăn",
    basePrice,
    addons,
    addonsTotal,
    price: basePrice + addonsTotal, // giá 1 phần (đã gồm size + topping)
    image: food?.image || food?.img || "",
    variant,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => safeParse(localStorage.getItem(LS_CART), []));
  const [appliedPromo, setAppliedPromo] = useState(() => safeParse(localStorage.getItem(LS_PROMO), null));

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedPromo) localStorage.setItem(LS_PROMO, JSON.stringify(appliedPromo));
    else localStorage.removeItem(LS_PROMO);
  }, [appliedPromo]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;

    const minOrder = Number(appliedPromo.minOrder || 0);
    if (subtotal < minOrder) return 0;

    if (appliedPromo.type === "amount") {
      return Math.min(Number(appliedPromo.value || 0), subtotal);
    }

    // percent
    const percent = Math.max(0, Math.min(100, Number(appliedPromo.value || 0)));
    const raw = (subtotal * percent) / 100;
    const max = Number(appliedPromo.maxDiscount || 0);
    const capped = max > 0 ? Math.min(raw, max) : raw;
    return Math.min(capped, subtotal);
  }, [appliedPromo, subtotal]);

  const total = Math.max(0, subtotal - discount);

  const addToCart = (food, quantity = 1, opts = {}) => {
    const base = normalizeItem(food, opts);
    if (!base.id) return;

    const q = Math.max(1, parseInt(quantity, 10) || 1);

    setCart((prev) => {
      const found = prev.find((x) => x.id === base.id);
      if (found) {
        const newQty = (found.quantity || 1) + q;
        toast.success(`✅ Đã tăng số lượng "${base.name}" lên ${newQty}`);
        return prev.map((x) => (x.id === base.id ? { ...x, quantity: newQty } : x));
      }
      toast.success(`✅ Đã thêm "${base.name}" vào giỏ`);
      return [{ ...base, quantity: q }, ...prev];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x.id !== id));
    toast.info("🗑️ Đã xóa khỏi giỏ");
  };

  const updateQuantity = (id, quantity) => {
    const q = Math.max(1, parseInt(quantity, 10) || 1);
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: q } : x)));
  };

  const increaseQuantity = (id) => {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: (x.quantity || 1) + 1 } : x)));
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, (x.quantity || 1) - 1) } : x))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    toast.info("🧹 Đã xóa giỏ hàng");
  };

  const applyPromo = (promo) => {
    setAppliedPromo(promo);
    toast.success(`🎟️ Đã áp mã ${promo.code}`);
  };

  const clearPromo = () => {
    setAppliedPromo(null);
    toast.info("🎟️ Đã gỡ mã giảm giá");
  };

  const value = {
    cart,
    subtotal,
    discount,
    total,
    appliedPromo,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    applyPromo,
    clearPromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
