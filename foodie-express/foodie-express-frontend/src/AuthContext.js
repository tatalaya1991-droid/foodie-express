// src/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser, socialLogin as socialLoginApi } from "./api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {
      // ignore
    }
  }, []);

  const saveSession = (data) => {
    if (data?.token) localStorage.setItem("token", data.token);
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const login = async (email, password, cb) => {
    try {
      const data = await loginUser({ email, password });
      saveSession(data);
      cb?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Đăng nhập thất bại");
    }
  };

  const register = async (name, email, password, cb) => {
    try {
      const data = await registerUser({ name, email, password });
      saveSession(data);
      cb?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Đăng ký thất bại");
    }
  };

  const socialLogin = async (idToken, cb) => {
    try {
      const data = await socialLoginApi(idToken);
      saveSession(data);
      cb?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Đăng nhập Google thất bại");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const value = useMemo(() => ({ user, login, register, socialLogin, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
