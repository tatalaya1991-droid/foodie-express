const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();


// Tạo đơn hàng
router.post('/', auth, async (req, res) => {
try {
const { orderItems } = req.body;
if (!orderItems || !orderItems.length)
return res.status(400).json({ message: 'Giỏ hàng trống' });


const totalPrice = orderItems.reduce((sum, i) => sum + i.qty*i.price, 0);
const order = await Order.create({ user: req.user._id, orderItems, totalPrice });
res.status(201).json(order);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Tạo đơn thất bại' });
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
