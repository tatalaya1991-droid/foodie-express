// src/AddressBook.js
import React, { useEffect, useState } from "react";
import { createAddress, deleteAddress, getAddresses, updateAddress } from "./api";

const empty = {
  label: "Nhà",
  recipientName: "",
  phone: "",
  line1: "",
  ward: "",
  district: "",
  city: "TP.HCM",
  note: "",
  isDefault: false,
};

export default function AddressBook() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.line1.trim()) return alert("Vui lòng nhập địa chỉ (Số nhà/Đường)");

    if (editingId) {
      await updateAddress(editingId, form);
    } else {
      await createAddress(form);
    }

    setForm(empty);
    setEditingId(null);
    await reload();
  };

  const onEdit = (a) => {
    setEditingId(a._id);
    setForm({
      label: a.label || "Nhà",
      recipientName: a.recipientName || "",
      phone: a.phone || "",
      line1: a.line1 || "",
      ward: a.ward || "",
      district: a.district || "",
      city: a.city || "TP.HCM",
      note: a.note || "",
      isDefault: !!a.isDefault,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    await deleteAddress(id);
    await reload();
  };

  const makeDefault = async (a) => {
    await updateAddress(a._id, { ...a, isDefault: true });
    await reload();
  };

  return (
    <div className="fe-summaryCard">
      <div style={{ fontWeight: 900, fontSize: 16 }}>🏠 Địa chỉ giao hàng</div>
      <div style={{ color: "#667085", fontSize: 13, marginTop: 6 }}>Thêm nhiều địa chỉ và chọn mặc định khi đặt hàng.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 12 }}>
        {loading ? (
          <div style={{ color: "#667085" }}>Đang tải…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "#667085" }}>Chưa có địa chỉ. Thêm ở form bên dưới.</div>
        ) : (
          items.map((a) => (
            <div key={a._id} style={{ border: "1px solid #eef2f6", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>
                    {a.label || "Địa chỉ"} {a.isDefault ? <span style={{ color: "#16a34a" }}>(Mặc định)</span> : null}
                  </div>
                  <div style={{ color: "#111", marginTop: 4 }}>
                    {a.line1}
                    {a.ward ? `, ${a.ward}` : ""}
                    {a.district ? `, ${a.district}` : ""}
                    {a.city ? `, ${a.city}` : ""}
                  </div>
                  <div style={{ color: "#667085", fontSize: 13, marginTop: 4 }}>
                    {a.recipientName ? `👤 ${a.recipientName}` : ""} {a.phone ? ` • 📞 ${a.phone}` : ""}
                  </div>
                  {a.note ? <div style={{ color: "#667085", fontSize: 13, marginTop: 4 }}>📝 {a.note}</div> : null}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {!a.isDefault && (
                    <button className="fe-pill" onClick={() => makeDefault(a)}>
                      Đặt mặc định
                    </button>
                  )}
                  <button className="fe-pill" onClick={() => onEdit(a)}>
                    Sửa
                  </button>
                  <button className="fe-pill" style={{ borderColor: "#ffd1d1", background: "#fff5f5", color: "#b42318" }} onClick={() => onDelete(a._id)}>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 900 }}>{editingId ? "✏️ Sửa địa chỉ" : "➕ Thêm địa chỉ"}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="fe-input" placeholder="Nhãn (Nhà / Công ty)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input className="fe-input" placeholder="Tên người nhận" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="fe-input" placeholder="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="fe-input" placeholder="Thành phố" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>

        <input className="fe-input" placeholder="Địa chỉ (Số nhà, đường...)" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="fe-input" placeholder="Phường/Xã" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
          <input className="fe-input" placeholder="Quận/Huyện" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        </div>

        <input className="fe-input" placeholder="Ghi chú (tùy chọn)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

        <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#667085", fontSize: 13 }}>
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
          Đặt làm mặc định
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="fe-btn fe-btn-primary" type="submit">
            {editingId ? "Lưu" : "Thêm"}
          </button>
          {editingId && (
            <button
              className="fe-btn"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(empty);
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
