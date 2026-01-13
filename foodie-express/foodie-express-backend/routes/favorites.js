const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');

// ✅ GET /api/favorites  -> danh sách món yêu thích (populate Food)
router.get('/', auth, async (req, res) => {
  try {
    const items = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('food');

    const foods = items
      .map((x) => x.food)
      .filter(Boolean);
    res.json({ foods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không lấy được danh sách yêu thích' });
  }
});

// ✅ POST /api/favorites/toggle { foodId }
router.post('/toggle', auth, async (req, res) => {
  try {
    const { foodId } = req.body;
    if (!foodId) return res.status(400).json({ message: 'foodId is required' });

    const existing = await Favorite.findOne({ user: req.user._id, food: foodId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ ok: true, action: 'removed' });
    }
    await Favorite.create({ user: req.user._id, food: foodId });
    return res.json({ ok: true, action: 'added' });
  } catch (err) {
    // duplicate key (đã tồn tại)
    if (err && err.code === 11000) return res.json({ ok: true, action: 'added' });
    console.error(err);
    res.status(500).json({ message: 'Không cập nhật yêu thích' });
  }
});

// ✅ DELETE /api/favorites/:foodId
router.delete('/:foodId', auth, async (req, res) => {
  try {
    const { foodId } = req.params;
    await Favorite.deleteOne({ user: req.user._id, food: foodId });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không xóa yêu thích' });
  }
});

module.exports = router;
