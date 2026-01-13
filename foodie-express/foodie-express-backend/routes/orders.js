const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const router = express.Router();

// Tạo đơn hàng
router.post('/', auth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, promoCode, discountAmount, shippingFee, paymentMethod } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || !orderItems.length) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    const itemsPrice = orderItems.reduce((sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0), 0);
    const ship = Math.max(0, Number(shippingFee || 0));

    const disc = Math.max(0, Number(discountAmount || 0));
    const finalPrice = Math.max(0, itemsPrice + ship - disc);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      itemsPrice,
      totalPrice: itemsPrice, // backward
      shippingFee: ship,
      promoCode: String(promoCode || ''),
      discountAmount: disc,
      finalPrice,
      shippingAddress: shippingAddress || {},
      paymentMethod: ['cod', 'stripe', 'qr'].includes(String(paymentMethod || '').toLowerCase())
        ? String(paymentMethod).toLowerCase()
        : 'cod',
      status: 'pending',
      statusHistory: [{ status: 'pending' }],
    });

    // Realtime notify staff dashboards
    const io = req.app.get('io');
    io?.to('role:support').emit('order:new', { orderId: order._id, status: order.status });
    io?.to('role:admin').emit('order:new', { orderId: order._id, status: order.status });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tạo đơn hàng' });
  }
});

// ===== Staff/Admin APIs =====
// List all orders (admin/support)
router.get('/admin/all', auth, requireRole('support', 'admin'), async (req, res) => {
  try {
    const status = req.query.status;
    const q = status ? { status } : {};
    const orders = await Order.find(q).populate('user', 'name email role').sort('-createdAt');
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn (admin)' });
  }
});

// Update status (support/admin)
router.patch('/:id/status', auth, requireRole('support', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
    if (!allowed.includes(String(status))) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (order.status !== status) {
      order.status = status;
      order.statusHistory = [...(order.statusHistory || []), { status, at: new Date(), by: req.user._id }];
      await order.save();
    }

    const io = req.app.get('io');
    const orderDto = { orderId: order._id, status: order.status, updatedAt: new Date() };
    io?.to(`user:${order.user.toString()}`).emit('order:updated', orderDto);
    io?.to('role:support').emit('order:updated', orderDto);
    io?.to('role:admin').emit('order:updated', orderDto);

    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái đơn' });
  }
});

// Demo: tăng trạng thái đơn (pending -> preparing -> delivering -> delivered)
router.post('/:id/demo-advance', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const flow = ['pending', 'preparing', 'delivering', 'delivered'];
    const idx = flow.indexOf(order.status);
    const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : order.status;

    if (next !== order.status) {
      order.status = next;
      order.statusHistory = [...(order.statusHistory || []), { status: next, at: new Date() }];
      await order.save();
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái (demo)' });
  }
});

// Lấy lịch sử đơn của user
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy đơn hàng' });
  }
});

module.exports = router;
