// Các chương trình khuyến mãi mẫu (chỉ frontend demo)
// Bạn có thể thay đổi thời gian/giảm giá tùy ý.

export const PROMOS = [
  {
    id: "tet-2026",
    title: "🎉 Tết Sale 2026",
    subtitle: "Giảm 20% cho đơn từ 99K",
    code: "TET20",
    percent: 20,
    start: "2026-01-10T00:00:00+07:00",
    end: "2026-02-15T23:59:59+07:00",
    rules: ["Áp dụng 1 mã/đơn", "Không cộng dồn", "Demo frontend – chưa trừ tiền thực"],
  },
  {
    id: "free-ship-weekend",
    title: "🚚 FreeShip Cuối Tuần",
    subtitle: "Miễn phí vận chuyển (demo)",
    code: "FREESHIP",
    percent: 0,
    start: "2026-01-01T00:00:00+07:00",
    end: "2026-12-31T23:59:59+07:00",
    rules: ["Áp dụng Thứ 7 & Chủ nhật", "Demo frontend"],
  },
];

export function getActivePromos(now = new Date()) {
  const t = now.getTime();
  return PROMOS.filter((p) => {
    const s = new Date(p.start).getTime();
    const e = new Date(p.end).getTime();
    return Number.isFinite(s) && Number.isFinite(e) && t >= s && t <= e;
  });
}
