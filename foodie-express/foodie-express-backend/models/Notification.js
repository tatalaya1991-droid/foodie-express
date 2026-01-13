const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    type: { type: String, default: 'info' }, // info | promo | system
    isRead: { type: Boolean, default: false },
    // key dùng để tránh tạo trùng (vd promo id)
    key: { type: String, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, key: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);
