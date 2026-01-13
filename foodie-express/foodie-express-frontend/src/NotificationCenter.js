// src/NotificationCenter.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearNotifications as clearNotificationsApi,
  getNotifications as getNotificationsApi,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
} from "./api";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);
export const useNotifications = () => useContext(NotificationsContext);

const LS_KEY = "fe_notifications_guest_v1";

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function makeGuestSeed() {
  return [
    {
      id: "guest_welcome",
      title: "👋 Chào bạn!",
      body: "Đăng nhập để đồng bộ thông báo và yêu thích (demo).",
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => safeParse(localStorage.getItem(LS_KEY), makeGuestSeed()));
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotificationsApi();
      setItems(data.items || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      reload();
      return;
    }
    // guest
    setItems((prev) => (Array.isArray(prev) && prev.length ? prev : makeGuestSeed()));
  }, [user]);

  useEffect(() => {
    if (!user) localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items, user]);

  const unreadCount = useMemo(() => items.filter((x) => !x.isRead).length, [items]);

  const markRead = async (id) => {
    setItems((prev) => prev.map((x) => ((x._id || x.id) === id ? { ...x, isRead: true } : x)));
    if (user) {
      try {
        await markNotificationReadApi(id);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    if (user) {
      try {
        await markAllNotificationsReadApi();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const clearAll = async () => {
    if (user) {
      try {
        await clearNotificationsApi();
      } catch (e) {
        console.warn(e);
      }
      setItems([]);
      return;
    }
    setItems([]);
    localStorage.removeItem(LS_KEY);
  };

  const api = useMemo(
    () => ({
      items,
      loading,
      unreadCount,
      reload,
      markRead,
      markAllRead,
      clearAll,
    }),
    [items, loading, unreadCount]
  );

  return <NotificationsContext.Provider value={api}>{children}</NotificationsContext.Provider>;
}

export default function NotificationCenter({ open, onClose }) {
  const noti = useNotifications();
  if (!open) return null;

  const items = noti?.items || [];
  const idOf = (x) => x._id || x.id;

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={head}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>🔔 Thông báo</div>
            <div style={{ color: "#667085", fontSize: 13 }}>
              Chưa đọc: <b>{noti.unreadCount}</b>
            </div>
          </div>
          <button style={iconBtn} onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        <div style={{ padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={pillBtn} onClick={noti.markAllRead} disabled={items.length === 0}>
            Đánh dấu đã đọc
          </button>
          <button style={pillBtn} onClick={noti.reload} disabled={noti.loading}>
            Làm mới
          </button>
          <button style={dangerBtn} onClick={noti.clearAll} disabled={items.length === 0}>
            Xóa tất cả
          </button>
        </div>

        <div style={list}>
          {items.length === 0 ? (
            <div style={{ padding: 16, color: "#667085" }}>Chưa có thông báo.</div>
          ) : (
            items.map((n) => (
              <div key={idOf(n)} style={{ ...row, background: n.isRead ? "white" : "#f7fbff" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>{n.title || "Thông báo"}</div>
                  <div style={{ color: "#667085", marginTop: 4 }}>{n.body || ""}</div>
                  <div style={{ color: "#98a2b3", fontSize: 12, marginTop: 6 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}
                  </div>
                </div>
                {!n.isRead ? (
                  <button style={pillBtn} onClick={() => noti.markRead(idOf(n))}>
                    Đã đọc
                  </button>
                ) : null}
              </div>
            ))
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
  alignItems: "flex-start",
  border: "1px solid #eef2f6",
  borderRadius: 14,
  padding: 12,
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
