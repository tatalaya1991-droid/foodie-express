const mongoose = require('mongoose');

// Lưu món ăn yêu thích theo user
// - food: tham chiếu Food
// - unique theo (user, food)
const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
