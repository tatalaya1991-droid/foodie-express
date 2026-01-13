const express = require('express');
const router = express.Router();

// ✅ Demo data khuyến mãi/sự kiện (không cần admin)
// Frontend gọi: GET /api/promotions
// Quy ước:
// - type: 'percent' hoặc 'amount'
// - minOrder: số tiền tối thiểu để áp
// - maxDiscount: giới hạn giảm (nếu type percent)
const PROMOS = [
  {
    id: 'tet_2026',
    title: '🎉 Tết 2026 – Giảm đến 30%',
    subtitle: 'Áp dụng cho đơn từ 99k. Số lượng có hạn!',
    code: 'TET2026',
    type: 'percent',
    value: 30,
    minOrder: 99000,
    maxDiscount: 60000,
    startsAt: '2026-01-10T00:00:00.000Z',
    endsAt: '2026-02-20T23:59:59.000Z',
    bannerImage:
      'https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'weekend_15',
    title: '🌟 Cuối tuần vui vẻ – Giảm 15%',
    subtitle: 'Tối đa 40k cho đơn từ 79k (demo).',
    code: 'WEEKEND15',
    type: 'percent',
    value: 15,
    minOrder: 79000,
    maxDiscount: 40000,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2026-12-31T23:59:59.000Z',
    bannerImage:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'ship_20k',
    title: '🚚 Freeship 20k (demo)',
    subtitle: 'Giảm thẳng 20k cho đơn từ 120k.',
    code: 'SHIP20K',
    type: 'amount',
    value: 20000,
    minOrder: 120000,
    maxDiscount: 20000,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2026-12-31T23:59:59.000Z',
    bannerImage:
      'https://images.unsplash.com/photo-1526366003456-05f41a06d70a?auto=format&fit=crop&w=1400&q=80',
  },
];

function isActive(p) {
  const now = Date.now();
  const start = Date.parse(p.startsAt);
  const end = Date.parse(p.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  return start <= now && now <= end;
}

router.get('/', (req, res) => {
  const promos = PROMOS.map((p) => ({ ...p, active: isActive(p) }));
  res.json({ promos });
});

module.exports = router;
