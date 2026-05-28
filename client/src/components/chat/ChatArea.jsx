import { memo, useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";

import Avatar from "../common/Avatar";
import EmptyState from "./EmptyState";
import { getMessages, sendMessage } from "../../services/api";

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ChatArea({ activeChat, isMobile, onOpenSidebar, currentUser, onConversationUpdated }) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    let mounted = true;
    setLoadingMessages(true);
    setMessages([]);

    (async () => {
      try {
        const res = await getMessages(activeChat.id);
        if (!mounted) return;
        setMessages(res.data?.data ?? []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeChat]);

  const chatMessages = useMemo(
    () =>
      messages.map((msg) => {
        const isMe =
          msg.sender?.toString()?.trim() ===
          currentUser?._id?.toString()?.trim();

        return {
          ...msg,
          isMe,
          time: formatTime(msg.createdAt),
        };
      }),
    [messages, currentUser]
  );

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activeChat) return;

    try {
      setSendError(null);
      const res = await sendMessage(activeChat.id, trimmed);
      const message = res.data?.data ?? null;

      if (message) {
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        if (onConversationUpdated) {
          onConversationUpdated();
        }
      }
    } catch (err) {
      console.error("Failed to send message", err);
      setSendError(
        err.response?.data?.message || err.message || "Failed to send message"
      );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeChat) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <EmptyState
          onOpenSidebar={onOpenSidebar}
          isMobile={isMobile}
          currentUser={currentUser}
        />
      </div>
    );
  }

  return (
    <motion.div
      key={activeChat.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex h-full flex-1 flex-col overflow-hidden"
    >
      {!isMobile && (
        <div
          className="flex items-center gap-3 border-b px-6 py-3.5"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "rgba(7,18,40,0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Avatar
            initials={activeChat.avatar}
            color={activeChat.color}
            size={38}
            online={activeChat.online}
            group={activeChat.group}
          />

          <div className="flex-1">
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                color: "#e2e8f0",
                letterSpacing: "-0.02em",
              }}
            >
              {activeChat.name}
            </div>

            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: activeChat.online
                  ? "rgba(34,211,238,0.7)"
                  : "rgba(100,116,139,0.5)",
              }}
            >
              {activeChat.online ? "Active now" : "Offline"}
            </div>
          </div>
        </div>
      )}

      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ background: "rgba(7,18,40,0.98)" }}
      >
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: isMobile ? "16px 14px" : "24px", scrollbarWidth: "none" }}
        >
          {loadingMessages && (
            <div style={{ color: "rgba(148,163,184,0.8)" }}>Loading messages...</div>
          )}

          {!loadingMessages && chatMessages.length === 0 && (
            <div
              style={{
                color: "rgba(148,163,184,0.8)",
                marginTop: "24px",
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              No messages yet. Send the first message to start the conversation.
            </div>
          )}

          <div className="flex flex-col gap-4">
            {chatMessages.map((msg, index) => (
              <motion.div
                key={msg._id ?? index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className={`flex items-end gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}
              >
                {!msg.isMe && (
                  <Avatar
                    initials={activeChat.avatar}
                    color={activeChat.color}
                    size={28}
                    group={activeChat.group}
                  />
                )}

                <div style={{ maxWidth: isMobile ? "75%" : "60%" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: msg.isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.isMe
                        ? "linear-gradient(135deg, #0ea5e9, #0891b2)"
                        : "rgba(255,255,255,0.06)",
                      border: msg.isMe ? "none" : "1px solid rgba(255,255,255,0.07)",
                      boxShadow: msg.isMe ? "0 0 16px rgba(14,165,233,0.25)" : "none",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: isMobile ? "13px" : "13.5px",
                      color: msg.isMe ? "#fff" : "#cbd5e1",
                      fontWeight: 300,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>

                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      color: "rgba(100,116,139,0.45)",
                      marginTop: "4px",
                      textAlign: msg.isMe ? "right" : "left",
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: isMobile ? "14px" : "18px",
            background: "rgba(7,18,40,0.92)",
          }}
        >
          {sendError && (
            <div style={{ color: "#f87171", marginBottom: "10px" }}>
              {sendError}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={2}
              style={{
                width: "100%",
                resize: "none",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#e2e8f0",
                padding: "12px 14px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                border: "none",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
                color: "#fff",
                padding: "12px 18px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ChatArea);
