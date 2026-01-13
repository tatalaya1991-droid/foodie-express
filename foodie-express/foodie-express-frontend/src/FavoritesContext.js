// src/FavoritesContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addFavorite, getFavorites, removeFavorite } from "./api";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);
export const useFavorites = () => useContext(FavoritesContext);

const LS_KEY = "fe_favorites_v2";

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(() => safeParse(localStorage.getItem(LS_KEY), []));

  // Sync: nếu có user -> load từ backend
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      try {
        const data = await getFavorites();
        const ids = (data.items || []).map((x) => x.foodId || x.food || x._id).filter(Boolean);
        if (alive) setFavoriteIds(ids);
      } catch (e) {
        console.warn(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const isFavorite = (id) => favoriteIds.includes(id);

  const toggleFavorite = async (foodId) => {
    if (!foodId) return;

    const nextIsFav = !favoriteIds.includes(foodId);
    setFavoriteIds((prev) => (nextIsFav ? [foodId, ...prev] : prev.filter((x) => x !== foodId)));

    // Nếu login thì sync backend
    if (user) {
      try {
        if (nextIsFav) await addFavorite(foodId);
        else await removeFavorite(foodId);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const clearFavorites = async () => {
    // chỉ local clear (demo)
    setFavoriteIds([]);
  };

  const value = useMemo(
    () => ({ favorites: favoriteIds, isFavorite, toggleFavorite, clearFavorites }),
    [favoriteIds]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
