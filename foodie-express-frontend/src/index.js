import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./AuthContext";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
);
