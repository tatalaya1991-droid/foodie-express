const express = require('express');
const Product = require('../models/Product');
const router = express.Router();


// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
try {
const products = await Product.find();
res.json(products);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Lỗi lấy sản phẩm' });
}
});


module.exports = router;
