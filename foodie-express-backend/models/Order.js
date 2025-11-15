const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
orderItems: [{
product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
name: String,
qty: Number,
price: Number,
image: String
}],
totalPrice: { type: Number, required: true },
estimatedDate: { type: Date, default: () => Date.now() + 3*24*60*60*1000 }
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);
