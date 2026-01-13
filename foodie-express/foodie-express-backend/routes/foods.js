const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// 30 món ăn mẫu
const sampleFoods = [
  { name: 'Pizza Hải Sản', description: 'Pizza phô mai hải sản tươi ngon', price: 120000, category: 'Món chính', image: '' },
  { name: 'Burger Bò Phô Mai', description: 'Burger bò Mỹ kèm phô mai tan chảy', price: 90000, category: 'Ăn nhanh', image: '' },
  { name: 'Trà Sữa Trân Châu', description: 'Trà sữa Đài Loan trân châu đen', price: 45000, category: 'Đồ uống', image: '' },
  { name: 'Cơm Chiên Dương Châu', description: 'Cơm chiên trứng, lạp xưởng, tôm', price: 70000, category: 'Món chính', image: '' },
  { name: 'Mì Ý Sốt Bò Bằm', description: 'Mì Ý sốt cà chua và thịt bò bằm', price: 85000, category: 'Món chính', image: '' },
  { name: 'Gà Rán Giòn Cay', description: 'Miếng gà giòn rụm vị cay nhẹ', price: 80000, category: 'Ăn nhanh', image: '' },
  { name: 'Khoai Tây Chiên', description: 'Khoai chiên vàng giòn', price: 40000, category: 'Ăn nhẹ', image: '' },
  { name: 'Nước Cam Ép', description: 'Nước cam tươi nguyên chất', price: 35000, category: 'Đồ uống', image: '' },
  { name: 'Cà Phê Sữa Đá', description: 'Cà phê phin Việt Nam truyền thống', price: 30000, category: 'Đồ uống', image: '' },
  { name: 'Sushi Cá Hồi', description: 'Sushi cá hồi tươi Nhật Bản', price: 150000, category: 'Món Nhật', image: '' },
  { name: 'Bánh Mì Thịt Nướng', description: 'Bánh mì Việt Nam giòn rụm', price: 25000, category: 'Ăn nhanh', image: '' },
  { name: 'Bún Bò Huế', description: 'Bún bò Huế chuẩn vị miền Trung', price: 60000, category: 'Món Việt', image: '' },
  { name: 'Phở Bò Tái', description: 'Phở bò tái thơm ngon', price: 65000, category: 'Món Việt', image: '' },
  { name: 'Gỏi Cuốn Tôm Thịt', description: 'Gỏi cuốn thanh mát, chấm tương đậu', price: 40000, category: 'Ăn nhẹ', image: '' },
  { name: 'Chè Ba Màu', description: 'Chè truyền thống Việt Nam', price: 30000, category: 'Tráng miệng', image: '' },
  { name: 'Sinh Tố Bơ', description: 'Sinh tố bơ béo mịn', price: 40000, category: 'Đồ uống', image: '' },
  { name: 'Tàu Hũ Nóng', description: 'Tàu hũ nước đường gừng', price: 25000, category: 'Tráng miệng', image: '' },
  { name: 'Mực Nướng Sa Tế', description: 'Mực nướng cay mặn hấp dẫn', price: 120000, category: 'Món nhậu', image: '' },
  { name: 'Ốc Len Xào Dừa', description: 'Ốc len béo ngậy vị dừa', price: 100000, category: 'Món nhậu', image: '' },
  { name: 'Lẩu Thái Hải Sản', description: 'Lẩu cay chua đặc trưng Thái Lan', price: 180000, category: 'Món chính', image: '' },
  { name: 'Cơm Tấm Sườn Bì Chả', description: 'Món ăn sáng quen thuộc', price: 65000, category: 'Món Việt', image: '' },
  { name: 'Trà Đào Cam Sả', description: 'Thức uống mát lạnh giải khát', price: 45000, category: 'Đồ uống', image: '' },
  { name: 'Bánh Xèo Tôm Thịt', description: 'Bánh xèo vàng giòn chấm nước mắm', price: 55000, category: 'Món Việt', image: '' },
  { name: 'Gà Nướng Mật Ong', description: 'Thịt gà nướng thơm lừng vị ngọt nhẹ', price: 95000, category: 'Món chính', image: '' },
  { name: 'Bánh Cuốn Nóng', description: 'Bánh cuốn nóng mềm mịn', price: 40000, category: 'Ăn sáng', image: '' },
  { name: 'Bánh Bao Trứng Muối', description: 'Nhân thịt trứng muối đậm vị', price: 30000, category: 'Ăn sáng', image: '' },
  { name: 'Nem Nướng Nha Trang', description: 'Nem nướng thơm lừng chấm tương đặc biệt', price: 70000, category: 'Món Việt', image: '' },
  { name: 'Cánh Gà Chiên Nước Mắm', description: 'Cánh gà chiên giòn, phủ nước mắm', price: 85000, category: 'Ăn nhanh', image: '' },
  { name: 'Mì Cay Hàn Quốc', description: 'Mì cay cấp độ Hàn Quốc', price: 80000, category: 'Món Hàn', image: '' },
  { name: 'Bánh Flan Caramen', description: 'Bánh flan ngọt béo mềm mịn', price: 25000, category: 'Tráng miệng', image: '' },
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

// Lấy chi tiết món ăn
router.get('/:id', async (req, res) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy chi tiết món ăn' });
  }
});

module.exports = router;
