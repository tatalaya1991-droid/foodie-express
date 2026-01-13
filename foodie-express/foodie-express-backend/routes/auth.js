const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ⚠️ Social login (Google/Facebook) (demo/local):
// Frontend gửi Firebase idToken lên. Ở môi trường production cần verify token bằng firebase-admin.
// Ở bản demo này, server chỉ decode JWT payload để lấy email/name.
function decodeJwtPayload(token) {
  try {
    const parts = String(token).split('.');
    if (parts.length < 2) return null;
    const payload = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}


// Register
router.post('/register', async (req, res) => {
try {
const { name, email, password } = req.body;
if (await User.findOne({ email }))
return res.status(400).json({ message: 'Email tồn tại' });

// Demo role assignment by env lists
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(s=>s.trim()).filter(Boolean);
const supportEmails = (process.env.SUPPORT_EMAILS || '').split(',').map(s=>s.trim()).filter(Boolean);
let role = 'customer';
if (adminEmails.includes(email)) role = 'admin';
else if (supportEmails.includes(email)) role = 'support';

const user = await User.create({ name, email, password, role });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
res.json({ token, user: { id: user._id, name, email, role: user.role } });
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
res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Đăng nhập thất bại' });
}
});

// Social login (Google/Facebook)
router.post('/social-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    const payload = decodeJwtPayload(idToken);
    const email = payload?.email;
    const name = payload?.name || (email ? email.split('@')[0] : 'User');
    if (!email) return res.status(400).json({ message: 'Không đọc được email từ idToken (demo)' });

    let user = await User.findOne({ email });
    if (!user) {
      // tạo user mới với mật khẩu random (không dùng)
      const randomPass = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(s=>s.trim()).filter(Boolean);
      const supportEmails = (process.env.SUPPORT_EMAILS || '').split(',').map(s=>s.trim()).filter(Boolean);
      let role = 'customer';
      if (adminEmails.includes(email)) role = 'admin';
      else if (supportEmails.includes(email)) role = 'support';
      user = await User.create({ name, email, password: randomPass, role });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Social login thất bại' });
  }
});


module.exports = router;
