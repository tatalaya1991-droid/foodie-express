const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    qty: Number,
    // giá 1 phần (đã gồm addons nếu có)
    price: Number,
    image: String,
    // addons (demo)
    addons: [
      {
        name: String,
        price: Number,
      },
    ],
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    orderItems: [orderItemSchema],

    // Trạng thái đơn (demo giống ShopeeFood)
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: { type: [statusHistorySchema], default: () => [{ status: 'pending' }] },

    // Thanh toán
    paymentMethod: {
      type: String,
      enum: ['cod', 'stripe', 'qr'],
      default: 'cod',
    },

    // Tổng tiền món (trước phí ship / giảm)
    itemsPrice: { type: Number, required: true },
    // Backward-compat: field cũ
    totalPrice: { type: Number, required: true },

    // Phí ship (demo)
    shippingFee: { type: Number, default: 0 },

    // Thông tin khuyến mãi
    promoCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },

    // Tổng sau giảm
    finalPrice: { type: Number, default: 0 },

    // Địa chỉ giao hàng (snapshot)
    shippingAddress: {
      label: { type: String, default: '' },
      recipientName: { type: String, default: '' },
      phone: { type: String, default: '' },
      line1: { type: String, default: '' },
      ward: { type: String, default: '' },
      district: { type: String, default: '' },
      city: { type: String, default: '' },
      note: { type: String, default: '' },
    },

    estimatedDate: { type: Date, default: () => Date.now() + 3 * 24 * 60 * 60 * 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
