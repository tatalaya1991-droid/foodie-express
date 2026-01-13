// src/api.js
// ✅ Cho phép đổi backend URL mà không sửa code
// - Dùng .env: REACT_APP_API_BASE_URL=http://localhost:5000
// - Nếu không set, tự fallback về cùng hostname và port 5000
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// ===== Foods =====
export async function getFoods() {
  const res = await fetch(`${API_BASE_URL}/api/foods`);
  if (!res.ok) throw new Error("Không lấy được danh sách món ăn");
  return res.json();
}

export async function getFoodById(id) {
  const res = await fetch(`${API_BASE_URL}/api/foods/${id}`);
  if (!res.ok) throw new Error("Không lấy được chi tiết món ăn");
  return res.json();
}

// ===== Auth =====
export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
  return data;
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
  return data;
}

// Google / social login (demo)
export async function socialLogin(idToken) {
  const res = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Đăng nhập Google thất bại");
  return data;
}

// ===== Promotions =====
export async function getPromotions() {
  const res = await fetch(`${API_BASE_URL}/api/promotions`);
  if (!res.ok) throw new Error("Không lấy được khuyến mãi");
  return res.json(); // { promos }
}

// ===== Notifications =====
export async function getNotifications() {
  const res = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không lấy được thông báo");
  return data; // { items }
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không cập nhật được");
  return data; // { item }
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không cập nhật được");
  return data;
}

export async function clearNotifications() {
  const res = await fetch(`${API_BASE_URL}/api/notifications/clear`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không xóa được");
  return data;
}

// ===== Favorites =====
export async function getFavorites() {
  const res = await fetch(`${API_BASE_URL}/api/favorites`, {
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không lấy được yêu thích");
  return data; // { items }
}

export async function addFavorite(foodId) {
  const res = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ foodId }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không thêm yêu thích");
  return data;
}

export async function removeFavorite(foodId) {
  const res = await fetch(`${API_BASE_URL}/api/favorites/${foodId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không bỏ yêu thích");
  return data;
}

// ===== Addresses =====
export async function getAddresses() {
  const res = await fetch(`${API_BASE_URL}/api/addresses`, {
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không lấy được địa chỉ");
  return data; // { items }
}

export async function createAddress(payload) {
  const res = await fetch(`${API_BASE_URL}/api/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không tạo được địa chỉ");
  return data; // { item }
}

export async function updateAddress(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không cập nhật được địa chỉ");
  return data;
}

export async function deleteAddress(id) {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không xóa được địa chỉ");
  return data;
}

// ===== Orders =====
export async function createOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không tạo được đơn hàng");
  return data;
}

export async function getMyOrders() {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không lấy được lịch sử đơn");
  return data;
}

// ===== Staff Orders (Admin/Support) =====
export async function getAllOrdersForStaff(status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/orders/admin/all${qs}`, {
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || 'Không lấy được danh sách đơn');
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ status }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || 'Không cập nhật được trạng thái');
  return data;
}

// ===== Conversations / Messages =====
export async function getMyConversation() {
  const res = await fetch(`${API_BASE_URL}/api/conversations/my`, { headers: { ...authHeader() } });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || 'Không lấy được conversation');
  return data;
}

export async function getConversationsForStaff(status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/conversations${qs}`, { headers: { ...authHeader() } });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || 'Không lấy được conversations');
  return data;
}

export async function getConversationMessages(conversationId) {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, { headers: { ...authHeader() } });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || 'Không lấy được messages');
  return data;
}

export async function markConversationRead(conversationId) {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/read`, {
    method: 'POST',
    headers: { ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || 'Không đánh dấu đã đọc');
  return data;
}

// ===== Payment (Stripe / QR) =====
export async function createStripeCheckoutSession(cartItems) {
  const res = await fetch(`${API_BASE_URL}/api/payment/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartItems }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không tạo được phiên thanh toán Stripe");
  return data; // { url }
}

export async function createPaymentQr(amount) {
  const res = await fetch(`${API_BASE_URL}/api/payment/create-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không tạo được QR");
  return data; // { qrUrl }
}

export async function demoAdvanceOrder(id) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}/demo-advance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Không cập nhật được trạng thái");
  return data;
}

export { API_BASE_URL };
