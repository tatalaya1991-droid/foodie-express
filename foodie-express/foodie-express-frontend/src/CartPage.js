// src/CartPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { createOrder, getAddresses, getPromotions, createStripeCheckoutSession, createPaymentQr } from "./api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CartPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { cart, subtotal, discount, total, appliedPromo, applyPromo, clearPromo, updateQuantity, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } =
    useCart();

  const [promos, setPromos] = useState([]);
  const [promoCode, setPromoCode] = useState(appliedPromo?.code || "");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentTab, setPaymentTab] = useState("cod"); // cod | stripe | qr
  const [qrUrl, setQrUrl] = useState("");
  const [openQr, setOpenQr] = useState(false);

  const fmt = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " đ";

  useEffect(() => {
    (async () => {
      try {
        const data = await getPromotions();
        setPromos(data.promos || []);
      } catch (e) {
        console.warn(e);
        setPromos([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getAddresses();
        const items = data.items || [];
        setAddresses(items);
        const def = items.find((x) => x.isDefault) || items[0];
        if (def) setSelectedAddressId(def._id);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [user]);

  const selectedAddress = useMemo(() => addresses.find((a) => a._id === selectedAddressId) || null, [addresses, selectedAddressId]);

  // ===== Shipping fee (demo) =====
  const shippingFee = useMemo(() => {
    if (!cart.length) return 0;
    // giả lập "khoảng cách" dựa trên district + số món
    const district = String(selectedAddress?.district || "").trim().toLowerCase();
    const seed = district
      .split("")
      .reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const km = 2 + (seed % 9); // 2..10km
    const base = 12000;
    const perKm = 2500;
    const perItem = 1000;
    return Math.round(base + km * perKm + cart.length * perItem);
  }, [cart.length, selectedAddress?.district]);

  const grandTotal = Math.max(0, total + shippingFee);

  const onApplyPromo = () => {
    const code = String(promoCode || "").trim().toUpperCase();
    if (!code) return;

    const p = promos.find((x) => String(x.code || "").toUpperCase() === code);
    if (!p) return toast.error("Mã giảm giá không tồn tại (demo).");

    if (!p.active) return toast.error("Mã này hiện chưa hoạt động (demo).");

    const minOrder = Number(p.minOrder || 0);
    if (subtotal < minOrder) {
      return toast.error(`Đơn tối thiểu ${fmt(minOrder)} mới dùng được mã này.`);
    }

    applyPromo(p);
  };

  const onPlaceOrder = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng.");
      nav("/login");
      return;
    }
    if (!cart.length) return toast.error("Giỏ hàng đang trống.");

    if (!selectedAddress) {
      toast.error("Bạn chưa chọn địa chỉ giao hàng. Vào Tài khoản để thêm địa chỉ.");
      nav("/account");
      return;
    }

    try {
      const orderItems = cart.map((it) => ({
        product: it.productId,
        name: it.name,
        qty: it.quantity,
        price: it.price,
        image: it.image,
        addons: it.addons || [],
      }));

      await createOrder({
        orderItems,
        shippingAddress: {
          label: selectedAddress.label,
          recipientName: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          line1: selectedAddress.line1,
          ward: selectedAddress.ward,
          district: selectedAddress.district,
          city: selectedAddress.city,
          note: selectedAddress.note,
        },
        promoCode: appliedPromo?.code || "",
        discountAmount: discount || 0,
        shippingFee,
        paymentMethod: paymentTab,
      });

      toast.success("✅ Tạo đơn thành công. Xem trong Tài khoản → Lịch sử đơn.");
      clearCart();
      nav("/account");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Đặt hàng thất bại");
    }
  };

  return (
    <div className="fe-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>🛒 Giỏ hàng</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="fe-pill" to="/">
            ← Trang chủ
          </Link>
          <Link className="fe-pill" to="/account">
            👤 Tài khoản
          </Link>
          <button className="fe-pill" onClick={clearCart} disabled={!cart.length}>
            Xóa giỏ
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 14 }}>
        {/* Left: items */}
        <div className="fe-summaryCard">
          {cart.length === 0 ? (
            <div style={{ color: "#667085" }}>Chưa có món nào trong giỏ. Về trang chủ để chọn món nhé.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {cart.map((it) => (
                <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid #eef2f6", borderRadius: 14, padding: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "#f2f4f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {it.image ? <img alt={it.name} src={it.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 22 }}>🍜</div>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900 }}>{it.name}</div>
                    <div style={{ color: "#667085", fontSize: 13 }}>{fmt(it.price)} / phần</div>
                    {it.variant ? (
                      <div style={{ color: "#667085", fontSize: 12, marginTop: 2 }}>Size: <b>{it.variant}</b></div>
                    ) : null}
                    {Array.isArray(it.addons) && it.addons.length ? (
                      <div style={{ color: "#667085", fontSize: 12, marginTop: 2 }}>
                        Topping: {it.addons.map((a) => `${a.name} (+${fmt(a.price)})`).join(", ")}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="fe-pill" onClick={() => decreaseQuantity(it.id)}>
                      −
                    </button>
                    <input
                      className="fe-input"
                      style={{ width: 80, textAlign: "center" }}
                      value={it.quantity}
                      onChange={(e) => updateQuantity(it.id, e.target.value)}
                    />
                    <button className="fe-pill" onClick={() => increaseQuantity(it.id)}>
                      +
                    </button>
                  </div>

                  <div style={{ width: 110, textAlign: "right", fontWeight: 900 }}>{fmt(it.price * it.quantity)}</div>

                  <button
                    className="fe-pill"
                    style={{ borderColor: "#ffd1d1", background: "#fff5f5", color: "#b42318" }}
                    onClick={() => removeFromCart(it.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div className="fe-summaryCard">
          <div style={{ fontWeight: 900, fontSize: 16 }}>🧾 Tóm tắt</div>

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <div style={sumRow}>
              <span>Tạm tính</span>
              <b>{fmt(subtotal)}</b>
            </div>

            <div style={sumRow}>
              <span>Giảm giá</span>
              <b style={{ color: discount ? "#16a34a" : "#111" }}>{discount ? `- ${fmt(discount)}` : fmt(0)}</b>
            </div>

            <div style={sumRow}>
              <span>Phí giao hàng (demo)</span>
              <b>{fmt(shippingFee)}</b>
            </div>

            <div style={{ ...sumRow, borderTop: "1px dashed #e5e7eb", paddingTop: 10 }}>
              <span>Tổng</span>
              <b style={{ fontSize: 18 }}>{fmt(grandTotal)}</b>
            </div>
          </div>

          {/* Promo */}
          <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 12 }}>
            <div style={{ fontWeight: 900 }}>🎟️ Mã giảm giá</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input className="fe-input" placeholder="Nhập mã (VD: TET2026)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button className="fe-pill primary" onClick={onApplyPromo} disabled={!promoCode.trim()}>
                Áp dụng
              </button>
            </div>

            {appliedPromo ? (
              <div style={{ marginTop: 8, color: "#16a34a", fontSize: 13, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div>
                  Đang áp: <b>{appliedPromo.code}</b> • {appliedPromo.type === "amount" ? `Giảm ${fmt(appliedPromo.value)}` : `Giảm ${appliedPromo.value}%`}
                </div>
                <button className="fe-pill" onClick={clearPromo}>
                  Gỡ
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 8, color: "#667085", fontSize: 13 }}>
                Gợi ý: {promos.filter((p) => p.active).slice(0, 3).map((p) => p.code).join(", ") || "Không có mã"}
              </div>
            )}
          </div>

          {/* Address */}
          <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 12 }}>
            <div style={{ fontWeight: 900 }}>📍 Địa chỉ giao hàng</div>
            {!user ? (
              <div style={{ marginTop: 8, color: "#667085", fontSize: 13 }}>
                Đăng nhập để chọn địa chỉ. <Link to="/login">Đăng nhập</Link>
              </div>
            ) : addresses.length === 0 ? (
              <div style={{ marginTop: 8, color: "#667085", fontSize: 13 }}>
                Bạn chưa có địa chỉ. Vào <Link to="/account">Tài khoản</Link> để thêm địa chỉ.
              </div>
            ) : (
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                <select className="fe-select" value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                  {addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.isDefault ? "⭐ " : ""}{a.label || "Địa chỉ"} - {a.line1}
                    </option>
                  ))}
                </select>

                {selectedAddress ? (
                  <div style={{ color: "#667085", fontSize: 13 }}>
                    {selectedAddress.recipientName ? `👤 ${selectedAddress.recipientName}` : ""} {selectedAddress.phone ? ` • 📞 ${selectedAddress.phone}` : ""}
                    <div style={{ marginTop: 4 }}>
                      {selectedAddress.line1}
                      {selectedAddress.district ? `, ${selectedAddress.district}` : ""} {selectedAddress.city ? `, ${selectedAddress.city}` : ""}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className={`fe-pill ${paymentTab === "cod" ? "primary" : ""}`} onClick={() => setPaymentTab("cod")}>
                🧾 COD/Đặt hàng
              </button>
              <button className={`fe-pill ${paymentTab === "stripe" ? "primary" : ""}`} onClick={() => setPaymentTab("stripe")}>
                💳 Stripe
              </button>
              <button className={`fe-pill ${paymentTab === "qr" ? "primary" : ""}`} onClick={() => setPaymentTab("qr")}>
                📱 QR VietQR
              </button>
            </div>

            {paymentTab === "cod" ? (
              <button className="fe-btn fe-btn-primary" onClick={onPlaceOrder} disabled={!cart.length}>
                Đặt hàng ngay
              </button>
            ) : null}

            {paymentTab === "stripe" ? (
              <button
                className="fe-btn fe-btn-primary"
                disabled={!cart.length}
                onClick={async () => {
                  try {
                    const data = await createStripeCheckoutSession(
                      cart.map((it) => ({ name: it.name, price: it.price, quantity: it.quantity, image: it.image }))
                    );
                    if (data?.url) window.location.href = data.url;
                    else toast.error("Không nhận được link Stripe");
                  } catch (e) {
                    console.error(e);
                    toast.error(e.message || "Không thể thanh toán Stripe");
                  }
                }}
              >
                Thanh toán bằng Stripe
              </button>
            ) : null}

            {paymentTab === "qr" ? (
              <button
                className="fe-btn fe-btn-primary"
                disabled={!cart.length}
                onClick={async () => {
                  try {
                    const data = await createPaymentQr(grandTotal);
                    if (data?.qrUrl) {
                      setQrUrl(data.qrUrl);
                      setOpenQr(true);
                    } else toast.error("Không nhận được QR");
                  } catch (e) {
                    console.error(e);
                    toast.error(e.message || "Không thể tạo QR");
                  }
                }}
              >
                Tạo QR để chuyển khoản
              </button>
            ) : null}

            <div style={{ color: "#667085", fontSize: 12 }}>
              * Stripe/QR là **thanh toán online**. Đặt hàng (COD) sẽ lưu đơn vào MongoDB và bạn xem trong Tài khoản.
            </div>
          </div>
        </div>
      </div>

      {openQr ? (
        <div className="fe-modalBackdrop" onClick={() => setOpenQr(false)}>
          <div className="fe-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>📱 QR Thanh toán (demo VietQR)</div>
              <button className="fe-pill" onClick={() => setOpenQr(false)}>
                Đóng
              </button>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {qrUrl ? <img alt="QR" src={qrUrl} style={{ width: "100%", maxWidth: 360, borderRadius: 14 }} /> : null}
              <div style={{ color: "#667085", fontSize: 12 }}>Quét mã bằng app ngân hàng để chuyển khoản đúng số tiền.</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const sumRow = { display: "flex", justifyContent: "space-between", alignItems: "center" };
