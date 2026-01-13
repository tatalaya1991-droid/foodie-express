import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from './SocketContext';
import { getMyConversation, getConversationMessages, markConversationRead } from './api';

const LS_KEY = "fe_chat_demo_v1";

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function nowHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const me = useMemo(() => {
    if (user?.email) return user.email;
    return "guest";
  }, [user]);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState(() => safeParse(localStorage.getItem(LS_KEY), []));

  const listRef = useRef(null);

  useEffect(() => {
    // Guest uses localStorage
    if (!user) localStorage.setItem(LS_KEY, JSON.stringify(messages));
  }, [messages, user]);

  // Load conversation when logged in
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const conv = await getMyConversation();
        if (!mounted) return;
        setConversationId(conv._id);

        const data = await getConversationMessages(conv._id);
        if (!mounted) return;
        setMessages(
          (data.messages || []).map((m) => ({
            from: m.senderRole,
            content: m.text,
            at: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: m.senderRole === 'customer' ? 'user' : 'bot',
          }))
        );
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Join socket room + realtime messages
  useEffect(() => {
    if (!socket || !connected || !conversationId) return;
    socket.emit('conv:join', conversationId);

    const onMessage = (msg) => {
      if (String(msg.conversationId) !== String(conversationId)) return;
      setMessages((prev) => [
        ...prev,
        {
          from: msg.senderRole,
          content: msg.text,
          at: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: msg.senderRole === 'customer' ? 'user' : 'bot',
        },
      ]);
    };
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
    };
  }, [socket, connected, conversationId]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 0);
    return () => clearTimeout(t);
  }, [open, messages]);

  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");

    // If not logged in => fallback demo
    if (!user || !socket) {
      const msg = { from: me, content, at: nowHHMM(), role: "user" };
      setMessages((prev) => [...prev, msg]);
      const reply = {
        from: "FoodieExpress",
        role: "bot",
        at: nowHHMM(),
        content:
          "Dạ shop đã nhận tin! (demo) Bạn có thể ghi: địa chỉ, ghi chú món, hoặc hỏi khuyến mãi hôm nay ạ 😊",
      };
      setTimeout(() => setMessages((prev) => [...prev, reply]), 450);
      return;
    }

    socket.emit(
      'chat:send',
      { conversationId, text: content },
      (ack) => {
        if (ack?.ok && ack.conversationId && !conversationId) {
          setConversationId(ack.conversationId);
        }
      }
    );
  };

  return (
    <>
      <button
        className="fe-chatFab"
        onClick={() => setOpen((v) => !v)}
        title="Chat với cửa hàng (demo)"
      >
        💬
      </button>

      {open ? (
        <div className="fe-chatPanel">
          <div className="fe-chatHeader">
            <b>💬 Chat cửa hàng (demo)</b>
            <button className="fe-pill" onClick={() => setOpen(false)}>
              Đóng
            </button>
          </div>

          <div ref={listRef} className="fe-chatList">
            {messages.length === 0 ? (
              <div style={{ color: "#667085", fontSize: 13 }}>Chưa có tin nhắn. Gửi thử "Xin mã giảm giá" 😄</div>
            ) : null}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`fe-chatBubble ${m.role === "user" ? "me" : "bot"}`}
              >
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 2 }}>
                  {m.role === "user" ? "Bạn" : "Shop"} • {m.at}
                </div>
                <div>{m.content}</div>
              </div>
            ))}
          </div>

          <div className="fe-chatComposer">
            <input
              className="fe-input"
              placeholder="Nhập tin nhắn..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button className="fe-pill primary" onClick={send}>
              Gửi
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
