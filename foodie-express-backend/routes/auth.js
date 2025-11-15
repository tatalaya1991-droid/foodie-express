const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


// Register
router.post('/register', async (req, res) => {
try {
const { name, email, password } = req.body;
if (await User.findOne({ email }))
return res.status(400).json({ message: 'Email tồn tại' });


const user = await User.create({ name, email, password });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
res.json({ token, user: { id: user._id, name, email } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Đăng ký thất bại' });
}
});


// Login
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user || !(await user.matchPassword(password)))
return res.status(400).json({ message: 'Thông tin không đúng' });


const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
res.json({ token, user: { id: user._id, name: user.name, email } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Đăng nhập thất bại' });
}
});


module.exports = router;
