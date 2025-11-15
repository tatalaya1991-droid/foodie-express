const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// 30 món ăn mẫu
const sampleFoods = [
  { name: 'Pizza Hải Sản', description: 'Pizza phô mai hải sản tươi ngon', price: 120000, category: 'Món chính', image: '/images/pizza-hai-san.jpg' },
  { name: 'Burger Bò Phô Mai', description: 'Burger bò Mỹ kèm phô mai tan chảy', price: 90000, category: 'Ăn nhanh', image: '/images/burger-bo.jpg' },
  { name: 'Trà Sữa Trân Châu', description: 'Trà sữa Đài Loan trân châu đen', price: 45000, category: 'Đồ uống', image: '/images/trasua.jpg' },
  { name: 'Cơm Chiên Dương Châu', description: 'Cơm chiên trứng, lạp xưởng, tôm', price: 70000, category: 'Món chính', image: '/images/comchien.jpg' },
  { name: 'Mì Ý Sốt Bò Bằm', description: 'Mì Ý sốt cà chua và thịt bò bằm', price: 85000, category: 'Món chính', image: '/images/miy.jpg' },
  { name: 'Gà Rán Giòn Cay', description: 'Miếng gà giòn rụm vị cay nhẹ', price: 80000, category: 'Ăn nhanh', image: '/images/garan.jpg' },
  { name: 'Khoai Tây Chiên', description: 'Khoai chiên vàng giòn', price: 40000, category: 'Ăn nhẹ', image: '/images/khoaitaychien.jpg' },
  { name: 'Nước Cam Ép', description: 'Nước cam tươi nguyên chất', price: 35000, category: 'Đồ uống', image: '/images/nuoccam.jpg' },
  { name: 'Cà Phê Sữa Đá', description: 'Cà phê phin Việt Nam truyền thống', price: 30000, category: 'Đồ uống', image: '/images/cafe.jpg' },
  { name: 'Sushi Cá Hồi', description: 'Sushi cá hồi tươi Nhật Bản', price: 150000, category: 'Món Nhật', image: '/images/sushi.jpg' },
  { name: 'Bánh Mì Thịt Nướng', description: 'Bánh mì Việt Nam giòn rụm', price: 25000, category: 'Ăn nhanh', image: '/images/banhmi.jpg' },
  { name: 'Bún Bò Huế', description: 'Bún bò Huế chuẩn vị miền Trung', price: 60000, category: 'Món Việt', image: '/images/bunbohue.jpg' },
  { name: 'Phở Bò Tái', description: 'Phở bò tái thơm ngon', price: 65000, category: 'Món Việt', image: '/images/pho.jpg' },
  { name: 'Gỏi Cuốn Tôm Thịt', description: 'Gỏi cuốn thanh mát, chấm tương đậu', price: 40000, category: 'Ăn nhẹ', image: '/images/goicuon.jpg' },
  { name: 'Chè Ba Màu', description: 'Chè truyền thống Việt Nam', price: 30000, category: 'Tráng miệng', image: '/images/che.jpg' },
  { name: 'Sinh Tố Bơ', description: 'Sinh tố bơ béo mịn', price: 40000, category: 'Đồ uống', image: '/images/sinhtobo.jpg' },
  { name: 'Tàu Hũ Nóng', description: 'Tàu hũ nước đường gừng', price: 25000, category: 'Tráng miệng', image: '/images/tauhu.jpg' },
  { name: 'Mực Nướng Sa Tế', description: 'Mực nướng cay mặn hấp dẫn', price: 120000, category: 'Món nhậu', image: '/images/mucnuong.jpg' },
  { name: 'Ốc Len Xào Dừa', description: 'Ốc len béo ngậy vị dừa', price: 100000, category: 'Món nhậu', image: '/images/oclen.jpg' },
  { name: 'Lẩu Thái Hải Sản', description: 'Lẩu cay chua đặc trưng Thái Lan', price: 180000, category: 'Món chính', image: '/images/lauhai.jpg' },
  { name: 'Cơm Tấm Sườn Bì Chả', description: 'Món ăn sáng quen thuộc', price: 65000, category: 'Món Việt', image: '/images/comtam.jpg' },
  { name: 'Trà Đào Cam Sả', description: 'Thức uống mát lạnh giải khát', price: 45000, category: 'Đồ uống', image: '/images/tradao.jpg' },
  { name: 'Bánh Xèo Tôm Thịt', description: 'Bánh xèo vàng giòn chấm nước mắm', price: 55000, category: 'Món Việt', image: '/images/banhxeo.jpg' },
  { name: 'Gà Nướng Mật Ong', description: 'Thịt gà nướng thơm lừng vị ngọt nhẹ', price: 95000, category: 'Món chính', image: '/images/ganuong.jpg' },
  { name: 'Bánh Cuốn Nóng', description: 'Bánh cuốn nóng mềm mịn', price: 40000, category: 'Ăn sáng', image: '/images/banhcuon.jpg' },
  { name: 'Bánh Bao Trứng Muối', description: 'Nhân thịt trứng muối đậm vị', price: 30000, category: 'Ăn sáng', image: '/images/banhbao.jpg' },
  { name: 'Nem Nướng Nha Trang', description: 'Nem nướng thơm lừng chấm tương đặc biệt', price: 70000, category: 'Món Việt', image: '/images/nemnuong.jpg' },
  { name: 'Cánh Gà Chiên Nước Mắm', description: 'Cánh gà chiên giòn, phủ nước mắm', price: 85000, category: 'Ăn nhanh', image: '/images/canhga.jpg' },
  { name: 'Mì Cay Hàn Quốc', description: 'Mì cay cấp độ Hàn Quốc', price: 80000, category: 'Món Hàn', image: '/images/micay.jpg' },
  { name: 'Bánh Flan Caramen', description: 'Bánh flan ngọt béo mềm mịn', price: 25000, category: 'Tráng miệng', image: '/images/flan.jpg' },
];

// ===== API: Lấy danh sách món ăn =====
router.get('/', async (req, res) => {
  try {
    let foods = await Food.find();

    // Nếu database rỗng, tự động thêm mẫu
    if (foods.length === 0) {
      await Food.insertMany(sampleFoods);
      foods = await Food.find();
      console.log('🍽️ Đã thêm 30 món ăn mẫu vào MongoDB!');
    }

    res.json(foods);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách món ăn:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách món ăn' });
  }
});

module.exports = router;
