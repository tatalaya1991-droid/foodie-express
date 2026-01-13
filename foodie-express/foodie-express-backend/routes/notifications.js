const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// ✅ Demo thông báo (tự seed theo user khi user mở app)
// Không cần trang admin.
const DEMO_SEEDS = [
  {
    key: 'promo_tet_2026',
    title: '🎉 Tết 2026 – Giảm đến 30%',
    body: 'Nhập mã TET2026 để nhận ưu đãi (demo).',
    type: 'promo',
  },
  {
    key: 'new_feature_favorite',
    title: '❤️ Tính năng mới: Món yêu thích',
    body: 'Bạn có thể thả tim để lưu món lại và xem nhanh trong mục Yêu thích.',
    type: 'info',
  },
  {
    key: 'address_book',
    title: '🏠 Tính năng mới: Địa chỉ giao hàng',
    body: 'Thêm nhiều địa chỉ và chọn mặc định khi đặt hàng.',
    type: 'info',
  },
];

async function ensureSeed(userId) {
  for (const s of DEMO_SEEDS) {
    const exist = await Notification.exists({ user: userId, key: s.key });
    if (!exist) {
      await Notification.create({
        user: userId,
        key: s.key,
        title: s.title,
        body: s.body,
        type: s.type,
        isRead: false,
      });
    }
  }
}

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    await ensureSeed(req.user._id);

    const items = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(200);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không lấy được thông báo' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không cập nhật được' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không cập nhật được' });
  }
});

// DELETE /api/notifications/clear
router.delete('/clear', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không xóa được' });
  }
});

module.exports = router;
