const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

// Customer: get or create their open conversation
router.get('/my', auth, async (req, res) => {
  try {
    let conv = await Conversation.findOne({ customerId: req.user._id, status: 'open' }).sort('-updatedAt');
    if (!conv) {
      conv = await Conversation.create({ customerId: req.user._id, status: 'open' });
    }
    res.json(conv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi lấy conversation' });
  }
});

// Support/Admin: list conversations (open first)
router.get('/', auth, requireRole('support', 'admin'), async (req, res) => {
  try {
    const status = req.query.status;
    const q = {};
    if (status) q.status = status;
    const convs = await Conversation.find(q)
      .populate('customerId', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort('-lastMessageAt');
    res.json(convs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi lấy conversations' });
  }
});

// Get messages of a conversation
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Không tìm thấy conversation' });

    const role = req.user.role || 'customer';
    const isOwner = conv.customerId.toString() === req.user._id.toString();
    const isStaff = ['support', 'admin'].includes(role);
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Forbidden' });

    const messages = await Message.find({ conversationId: conv._id }).sort('createdAt');
    res.json({ conversation: conv, messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi lấy messages' });
  }
});

// Mark conversation as read (demo counters)
router.post('/:id/read', auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Không tìm thấy conversation' });

    const role = req.user.role || 'customer';
    const isOwner = conv.customerId.toString() === req.user._id.toString();
    const isStaff = ['support', 'admin'].includes(role);
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Forbidden' });

    if (isOwner) conv.unreadByCustomer = 0;
    if (isStaff) conv.unreadBySupport = 0;
    await conv.save();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi read conversation' });
  }
});

module.exports = router;
