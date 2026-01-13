// src/RequireAuth.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // chuyển về login, nhớ trang trước đó để login xong quay lại
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
