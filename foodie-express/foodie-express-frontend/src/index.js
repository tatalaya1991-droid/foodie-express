// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ UI framework & toast styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import AuthProvider from "./AuthContext";     // ✅ AuthProvider đang default export
import { CartProvider } from "./CartContext"; // ✅ CartProvider là named export

import { FavoritesProvider } from "./FavoritesContext";
import { NotificationsProvider } from "./NotificationCenter";
import SocketProvider from "./SocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
      <CartProvider>
        <FavoritesProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </FavoritesProvider>
      </CartProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
