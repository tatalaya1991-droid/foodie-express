# FoodieExpress Frontend (Updated)

## Tính năng mới

- UI header/home mượt hơn
- 🔔 **Thông báo**
  - Nếu **đã đăng nhập**: đọc/đánh dấu đã đọc/xóa từ backend (`/api/notifications`)
  - Nếu **chưa đăng nhập**: fallback localStorage
- 🎉 **Sale/Sự kiện**
  - Ưu tiên lấy từ backend (`/api/promotions`), fallback `promoData.js`
- ❤️ **Món yêu thích**
  - Nếu **đã đăng nhập**: sync MongoDB qua backend (`/api/favorites`)
  - Nếu **chưa đăng nhập**: lưu localStorage

## Chạy project

```bash
npm install
npm start
```

Mặc định FE gọi API: `http://localhost:5000` (file `src/api.js`).