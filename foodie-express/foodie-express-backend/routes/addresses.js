const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Address = require('../models/Address');

function normalize(body = {}) {
  return {
    label: String(body.label || 'Nhà').slice(0, 30),
    recipientName: String(body.recipientName || '').slice(0, 60),
    phone: String(body.phone || '').slice(0, 30),
    line1: String(body.line1 || '').trim().slice(0, 120),
    ward: String(body.ward || '').slice(0, 60),
    district: String(body.district || '').slice(0, 60),
    city: String(body.city || 'TP.HCM').slice(0, 60),
    note: String(body.note || '').slice(0, 120),
    isDefault: Boolean(body.isDefault),
  };
}

// GET /api/addresses
router.get('/', auth, async (req, res) => {
  try {
    const items = await Address.find({ user: req.user._id }).sort('-isDefault -updatedAt');
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không lấy được địa chỉ' });
  }
});

// POST /api/addresses
router.post('/', auth, async (req, res) => {
  try {
    const data = normalize(req.body);
    if (!data.line1) return res.status(400).json({ message: 'Thiếu địa chỉ (line1)' });

    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
    } else {
      // Nếu user chưa có default, set default cho địa chỉ đầu tiên
      const hasDefault = await Address.exists({ user: req.user._id, isDefault: true });
      if (!hasDefault) data.isDefault = true;
    }

    const created = await Address.create({ ...data, user: req.user._id });
    res.json({ item: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không tạo được địa chỉ' });
  }
});

// PUT /api/addresses/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const data = normalize(req.body);

    const exists = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!exists) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
    }

    const updated = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: data },
      { new: true }
    );
    res.json({ item: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không cập nhật được địa chỉ' });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const removed = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!removed) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    // đảm bảo luôn có default nếu còn địa chỉ
    const anyDefault = await Address.exists({ user: req.user._id, isDefault: true });
    if (!anyDefault) {
      const one = await Address.findOne({ user: req.user._id }).sort('-updatedAt');
      if (one) {
        one.isDefault = true;
        await one.save();
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không xóa được địa chỉ' });
  }
});

module.exports = router;
