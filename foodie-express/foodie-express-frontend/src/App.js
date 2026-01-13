// src/App.js
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

import { getFoods, getPromotions } from "./api";
import FoodItem from "./FoodItem";
import CartPage from "./CartPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import PaymentResultPage from "./PaymentResultPage";
import FoodDetailPage from "./FoodDetailPage";
import AccountPage from "./AccountPage";
import ChatWidget from "./ChatWidget";
import StaffPanel from './StaffPanel';

import RequireAuth from "./RequireAuth";
import RequireRole from './RequireRole';
import FavoritesModal from "./FavoritesModal";
import NotificationCenter, { useNotifications } from "./NotificationCenter";
import BannerSlider from "./BannerSlider";
import { ToastContainer } from "react-toastify";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

function HomePage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  const noti = useNotifications();

  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodsErr, setFoodsErr] = useState("");
  const [promos, setPromos] = useState([]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [category, setCategory] = useState("all");

  const [openFav, setOpenFav] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setFoodsLoading(true);
        setFoodsErr("");
        const data = await getFoods();
        if (alive) setFoods(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (alive) {
          setFoods([]);
          setFoodsErr("Không tải được món ăn. Hãy chắc chắn backend đang chạy ở :5000 và MongoDB đã bật.");
        }
      } finally {
        if (alive) setFoodsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPromotions();
        if (alive) setPromos(data.promos || []);
      } catch (e) {
        console.warn(e);
        if (alive) setPromos([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visibleFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...foods];

    if (q) {
      list = list.filter((f) => {
        const name = (f?.name || "").toLowerCase();
        const desc = (f?.description || f?.desc || "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    if (category !== "all") {
      list = list.filter((f) => {
        const c = String(f?.category || f?.type || "Khác");
        return c === category;
      });
    }

    if (sort === "price_asc") list.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    if (sort === "price_desc") list.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    if (sort === "name_asc") list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "vi"));
    if (sort === "popular") list.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0));

    return list;
  }, [foods, search, sort, category]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const f of foods) set.add(String(f?.category || f?.type || "Khác"));
    return ["all", ...Array.from(set).filter(Boolean)];
  }, [foods]);

  return (
    <>
      <div className="fe-topbar">
        <div className="fe-topbar-inner">
          <Link className="fe-brand" to="/">
            🍱 FoodieExpress
          </Link>

          <div className="fe-search">
            <input className="fe-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔎 Tìm món, tìm đồ uống..." />
            <select className="fe-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Phổ biến</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name_asc">Tên A-Z</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="fe-pill" onClick={() => setOpenNoti(true)} title="Thông báo">
              🔔 {noti.unreadCount ? <b style={{ marginLeft: 6 }}>{noti.unreadCount}</b> : null}
            </button>
            <button className="fe-pill" onClick={() => setOpenFav(true)} title="Yêu thích">
              ❤️
            </button>

            <button className="fe-pill primary" onClick={() => nav("/cart")} title="Giỏ hàng">
              🛒 {cart.length ? <b style={{ marginLeft: 6 }}>{cart.length}</b> : null}
            </button>

            {user ? (
              <button className="fe-pill" onClick={() => nav("/account")} title="Tài khoản">
                👤
              </button>
            ) : (
              <button className="fe-pill" onClick={() => nav("/login")} title="Đăng nhập">
                Đăng nhập
              </button>
            )}

            {user && (user.role === 'support' || user.role === 'admin') ? (
              <button className="fe-pill" onClick={() => nav('/staff')} title="Bảng quản trị">
                🛠
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="fe-container">
        <div className="fe-hero">
          <div>
            <h1>Đặt đồ ăn nhanh như ShopeeFood (demo)</h1>
            <p>Slider banner • Chi tiết món • Áp mã giảm giá • Địa chỉ giao hàng • Lịch sử đơn</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link className="fe-pill" to="/account">
              Quản lý địa chỉ
            </Link>
            <Link className="fe-pill primary" to="/cart">
              Đặt ngay
            </Link>
          </div>
        </div>

        <BannerSlider promos={promos} />

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`fe-pill ${category === c ? "primary" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c === "all" ? "Tất cả" : c}
            </button>
          ))}
        </div>

        <div className="fe-section-title">🔥 Gợi ý hôm nay</div>
        {foodsLoading ? (
          <div className="fe-summaryCard">Đang tải món ăn...</div>
        ) : foodsErr ? (
          <div className="fe-summaryCard">
            {foodsErr}
            <div style={{ marginTop: 10 }}>
              <button className="fe-btn fe-btn-primary" onClick={() => window.location.reload()}>
                Tải lại
              </button>
            </div>
          </div>
        ) : (
          <div className="fe-grid">
            {visibleFoods.map((f) => (
              <FoodItem key={f._id || f.id} food={f} />
            ))}
          </div>
        )}
      </div>

      <FavoritesModal open={openFav} onClose={() => setOpenFav(false)} foods={foods} onSelectFood={(f) => nav(`/food/${f._id || f.id}`)} />
      <NotificationCenter open={openNoti} onClose={() => setOpenNoti(false)} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={1800} />

      <ChatWidget />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/food/:id" element={<FoodDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireRole roles={["support", "admin"]}>
              <StaffPanel />
            </RequireRole>
          }
        />
        <Route
          path="*"
          element={
            <div className="fe-container">
              <div className="fe-summaryCard">
                Không tìm thấy trang. <Link to="/">Về trang chủ</Link>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
