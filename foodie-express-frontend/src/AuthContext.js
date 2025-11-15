// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { registerUser, loginUser } from "./api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ Lưu thông tin đăng nhập
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // 🧩 Đăng ký
  const register = async (name, email, password, onSuccess) => {
    try {
      const res = await registerUser({ name, email, password });
      setUser(res.user);
      localStorage.setItem("token", res.token);
      toast.success("🎉 Đăng ký thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Đăng ký thất bại!");
    }
  };

  // 🔑 Đăng nhập
  const login = async (email, password, onSuccess) => {
    try {
      const res = await loginUser({ email, password });
      setUser(res.user);
      localStorage.setItem("token", res.token);
      toast.success("✅ Đăng nhập thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Sai tài khoản hoặc mật khẩu!");
    }
  };

  // 🚪 Đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast.info("👋 Đã đăng xuất!");
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
