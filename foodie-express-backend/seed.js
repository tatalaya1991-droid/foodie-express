require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');


mongoose.connect(process.env.MONGO_URI)
.then(async () => {
await Product.deleteMany();
const products = [
{ name:'Bánh Mì Thịt', category:'Fast Food', image:'/images/banhmi.jpg', price:20000, countInStock:50 },
{ name:'Trà Sữa Trân Châu', category:'Drinks', image:'/images/trasua.jpg', price:30000, countInStock:100 },
{ name:'Kem Dâu', category:'Desserts', image:'/images/kemdau.jpg', price:25000, countInStock:80 },
];
await Product.insertMany(products);
console.log('Seeding thành công');
process.exit();
})
.catch(err => console.error(err));
