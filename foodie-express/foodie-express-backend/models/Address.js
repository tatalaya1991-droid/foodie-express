const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Nhà' },
    recipientName: { type: String, default: '' },
    phone: { type: String, default: '' },
    line1: { type: String, required: true }, // số nhà, đường
    ward: { type: String, default: '' },
    district: { type: String, default: '' },
    city: { type: String, default: 'TP.HCM' },
    note: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
