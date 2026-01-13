# FoodieExpress Backend (Updated)

## Tính năng thêm mới (không ảnh hưởng chức năng cũ)

1. **Promotions / Sale demo**
   - `GET /api/promotions` trả về danh sách khuyến mãi demo (không cần admin)

2. **Notifications (MongoDB demo, theo user)**
   - `GET /api/notifications` (cần token) tự seed thông báo demo lần đầu
   - `POST /api/notifications/read-all`
   - `POST /api/notifications/:id/read`
   - `DELETE /api/notifications`

3. **Favorites (MongoDB, theo user)**
   - `GET /api/favorites` (cần token) trả về danh sách món yêu thích
   - `POST /api/favorites/toggle { foodId }` (cần token)
   - `DELETE /api/favorites/:foodId` (cần token)

4. **Social login endpoint**
   - `POST /api/auth/social-login { idToken }`
   - Bản demo local: server **decode** payload để lấy email/name (production cần verify bằng firebase-admin).

## Chạy project

```bash
npm install
npm start
```

Thiết lập `.env` (ví dụ):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/foodsdb
JWT_SECRET=your_secret
CORS_ORIGINS=http://localhost:3000
```
