import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { getAllOrdersForStaff, updateOrderStatus, getConversationsForStaff, getConversationMessages, markConversationRead } from './api';

function Badge({ children }) {
  return <span style={{ background: '#111827', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>{children}</span>;
}

export default function StaffPanel() {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  const { socket, connected } = useSocket();

  const [tab, setTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [convs, setConvs] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await getAllOrdersForStaff(statusFilter === 'all' ? undefined : statusFilter);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Không lấy được đơn');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await getConversationsForStaff('open');
      setConvs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const openConversation = async (cid) => {
    setActiveConvId(cid);
    try {
      const data = await getConversationMessages(cid);
      setMessages(data.messages || []);
      await markConversationRead(cid);
      if (socket && connected) socket.emit('conv:join', cid);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Không mở được chat');
    }
  };

  useEffect(() => {
    loadOrders();
    loadConversations();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [statusFilter]);

  // Realtime: orders
  useEffect(() => {
    if (!socket || !connected) return;
    const onNew = () => loadOrders();
    const onUpdated = () => loadOrders();
    socket.on('order:new', onNew);
    socket.on('order:updated', onUpdated);
    return () => {
      socket.off('order:new', onNew);
      socket.off('order:updated', onUpdated);
    };
    // eslint-disable-next-line
  }, [socket, connected, statusFilter]);

  // Realtime: inbox updates + messages
  useEffect(() => {
    if (!socket || !connected) return;
    const onInbox = () => loadConversations();
    const onMsg = (m) => {
      if (activeConvId && String(m.conversationId) === String(activeConvId)) {
        setMessages((prev) => [...prev, m]);
      }
      loadConversations();
    };
    socket.on('chat:inbox_update', onInbox);
    socket.on('chat:message', onMsg);
    return () => {
      socket.off('chat:inbox_update', onInbox);
      socket.off('chat:message', onMsg);
    };
    // eslint-disable-next-line
  }, [socket, connected, activeConvId]);

  const sendMessage = () => {
    const t = msgText.trim();
    if (!t || !socket) return;
    setMsgText('');
    socket.emit('chat:send', { conversationId: activeConvId, text: t }, (ack) => {
      if (!ack?.ok) alert(ack?.message || 'Gửi thất bại');
    });
  };

  const changeStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      // realtime handled by server
    } catch (e) {
      console.error(e);
      alert(e.message || 'Không cập nhật được');
    }
  };

  const title = role === 'admin' ? 'Admin Panel' : 'Support Panel';

  return (
    <div className="container" style={{ padding: 16, maxWidth: 1100 }}>
      <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
        <h3 style={{ margin: 0 }}>{title} <span style={{ marginLeft: 8 }}>{connected ? <Badge>LIVE</Badge> : <Badge>OFFLINE</Badge>}</span></h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${tab === 'orders' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTab('orders')}>Đơn hàng</button>
          <button className={`btn btn-sm ${tab === 'chat' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTab('chat')}>Chat hỗ trợ</button>
        </div>
      </div>

      {tab === 'orders' ? (
        <div style={{ marginTop: 16 }}>
          <div className="d-flex" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <b>Filter:</b>
            <select className="form-select form-select-sm" style={{ width: 220 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="delivering">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã huỷ</option>
              <option value="all">Tất cả</option>
            </select>
            <button className="btn btn-sm btn-outline-secondary" onClick={loadOrders} disabled={loadingOrders}>Reload</button>
          </div>

          <div className="table-responsive" style={{ marginTop: 12 }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Tổng</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 220 }}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontFamily: 'monospace' }}>{o._id.slice(-6)}</td>
                    <td>{o.user?.name || o.user?.email || '—'}</td>
                    <td>{Math.round(o.finalPrice || o.totalPrice || 0).toLocaleString()} đ</td>
                    <td>{String(o.paymentMethod || 'cod').toUpperCase()}</td>
                    <td><Badge>{o.status}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select className="form-select form-select-sm" defaultValue={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="preparing">preparing</option>
                          <option value="delivering">delivering</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ color: '#6b7280' }}>Không có đơn phù hợp.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === 'chat' ? (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
          <div className="card" style={{ borderRadius: 16 }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <b>Hộp thư</b>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadConversations}>Reload</button>
              </div>
              <div style={{ marginTop: 10, maxHeight: 520, overflow: 'auto' }}>
                {convs.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => openConversation(c._id)}
                    className={`btn w-100 text-start ${activeConvId === c._id ? 'btn-dark' : 'btn-outline-dark'}`}
                    style={{ marginBottom: 8, borderRadius: 14 }}
                  >
                    <div style={{ fontWeight: 600 }}>{c.customerId?.name || c.customerId?.email || 'Khách'}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Unread: {c.unreadBySupport || 0} • {new Date(c.lastMessageAt).toLocaleString()}</div>
                  </button>
                ))}
                {convs.length === 0 ? <div style={{ color: '#6b7280' }}>Chưa có cuộc chat.</div> : null}
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 16 }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
              <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 8 }}>
                <b>Đang chat</b>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{activeConvId ? activeConvId : 'Chọn 1 cuộc chat bên trái'}</span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 8, background: '#f8fafc', borderRadius: 14 }}>
                {messages.map((m) => (
                  <div key={m._id} style={{ marginBottom: 10, display: 'flex', justifyContent: m.senderRole === 'customer' ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '70%', background: 'white', borderRadius: 14, padding: '8px 10px', boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
                      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>{m.senderRole} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input className="form-control" value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Nhập tin nhắn..." onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} disabled={!activeConvId} />
                <button className="btn btn-dark" onClick={sendMessage} disabled={!activeConvId}>Gửi</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
