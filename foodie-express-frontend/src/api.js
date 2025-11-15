const API_BASE_URL = "http://localhost:5000"; // backend đang chạy

// 🥗 Lấy danh sách món ăn
export async function getFoods() {
  const res = await fetch(`${API_BASE_URL}/api/foods`);
  return res.json();
}

// 👤 Đăng ký người dùng
export async function registerUser(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Đăng ký thất bại");
  }

  return res.json();
}

// 🔑 Đăng nhập người dùng
export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Đăng nhập thất bại");
  }

  return res.json();
}
