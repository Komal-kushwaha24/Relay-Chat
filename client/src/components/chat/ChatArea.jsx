import { memo, useMemo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import Avatar from "../common/Avatar";
import EmptyState from "./EmptyState";
import { getMessages, sendMessage } from "../../services/api";
import { getSocket } from "../../services/socket";

const getMessageId = (message) =>
  message?.tempId?.toString?.() ??
  message?._id?.toString?.() ??
  message?.id?.toString?.();

const mergeMessages = (existing = [], incoming = []) => {
  const seen = new Set();
  const merged = [];

  [...existing, ...incoming].forEach((message) => {
    const id = getMessageId(message);
    if (!id || seen.has(id)) {
      return;
    }

    seen.add(id);
    merged.push(message);
  });

  return merged;
};

const replacePendingMessage = (existing = [], tempId, incoming) => {
  if (!tempId) {
    return mergeMessages(existing, [incoming]);
  }

  let replaced = false;
  const updated = existing.map((message) => {
    if (message.tempId === tempId) {
      replaced = true;
      return incoming;
    }
    return message;
  });

  if (replaced) {
    return mergeMessages(updated, []);
  }

  return mergeMessages(existing, [incoming]);
};

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ChatArea({
  activeChat,
  isMobile,
  onOpenSidebar,
  currentUser,
  conversations,
  onConversationUpdated,
  sentRequests,
  setSentRequests,
  onExitChat,
}) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendError, setSendError] = useState(null);
  const socket = getSocket();
  const messagesEndRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const emitTyping = (isTyping) => {
    try {
      if (!socket || !socket.connected || !activeChat) return;
      socket.emit('chat:typing', { roomId: activeChat.id, isTyping });
    } catch (e) {
      // ignore
    }
  };

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
        setMessages((prev) => mergeMessages(prev, res.data?.data ?? []));
        if (onConversationUpdated) {
          onConversationUpdated({
            conversationId: activeChat.id,
            unreadCount: 0,
          });
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeChat?.id]);

  useEffect(() => {
    const roomId = activeChat?.id;
    if (!roomId) return;

    const handleIncomingMessage = (payload) => {
      if (!payload || payload.roomId !== roomId || !payload.message) {
        return;
      }

      setMessages((prev) => mergeMessages(prev, [payload.message]));
    };

    const handleIncomingTyping = (payload) => {
      if (!payload || payload.roomId !== roomId) return;
      const { userId, name, isTyping } = payload;
      const myId = currentUser?._id?.toString?.() || currentUser?.id?.toString?.();
      if (!userId || userId === myId) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, name }];
        }
        return prev.filter((u) => u.userId !== userId);
      });
    };

    socket.emit("chat:join", roomId, (response) => {
      if (!response?.success) {
        console.error("Failed to join chat room", response?.message);
      }
    });

    socket.on("chat:message", handleIncomingMessage);
    socket.on("chat:typing", handleIncomingTyping);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
      socket.off("chat:typing", handleIncomingTyping);
      setTypingUsers([]);
      socket.emit("chat:leave", roomId);
    };
  }, [activeChat?.id, socket]);

  const emitChatMessage = (payload) =>
    new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error("Socket is not connected"));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error("No acknowledgment from server"));
      }, 5000);

      socket.emit("chat:message", payload, (response) => {
        clearTimeout(timeoutId);

        if (!response) {
          reject(new Error("No acknowledgment from server"));
          return;
        }

        if (response instanceof Error) {
          reject(response);
          return;
        }

        if (!response.success) {
          reject(new Error(response.message || "Failed to send message"));
          return;
        }

        resolve(response.data);
      });
    });

  useEffect(() => {
    if (!activeChat) return;
    const element = messagesEndRef.current;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, activeChat?.id]);

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

    setSendError(null);

    const payload = {
      roomId: activeChat.id,
      text: trimmed,
    };

    const tempId = `pending-${Date.now()}`;
    const pendingMessage = {
      _id: tempId,
      tempId,
      sender: currentUser?._id?.toString?.() || currentUser?.id?.toString?.(),
      conversation: activeChat.id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => mergeMessages(prev, [pendingMessage]));
    setNewMessage("");

    try {
      const sentMessage = await emitChatMessage(payload);
      setMessages((prev) => replacePendingMessage(prev, tempId, sentMessage));
      // stop typing when message sent
      emitTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (onConversationUpdated) {
        onConversationUpdated({
          conversationId: activeChat.id,
          lastMessage: sentMessage.text,
          updatedAt: sentMessage.createdAt || new Date().toISOString(),
        });
      }
    } catch (err) {
      if (!socket?.connected) {
        try {
          const res = await sendMessage(activeChat.id, trimmed);
          const message = res.data?.data ?? null;
          if (message) {
            setMessages((prev) => replacePendingMessage(prev, tempId, message));
            // stop typing after fallback send
            emitTyping(false);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = null;
            }
            if (onConversationUpdated) {
              onConversationUpdated({
                conversationId: activeChat.id,
                lastMessage: message.text,
                updatedAt: message.createdAt || new Date().toISOString(),
              });
            }
          }
        } catch (apiErr) {
          console.error("Failed to send message", apiErr);
          setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
          setSendError(
            apiErr.response?.data?.message || apiErr.message || err.message || "Failed to send message"
          );
        }
      } else {
        console.error("Failed to send message", err);
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        setSendError(err.message || "Failed to send message");
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);

    // emit typing true immediately
    emitTyping(true);

    // debounce stop typing after 1.5s of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
      typingTimeoutRef.current = null;
    }, 1500);
  };

  if (!activeChat) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <EmptyState
          onOpenSidebar={onOpenSidebar}
          isMobile={isMobile}
          currentUser={currentUser}
          conversations={conversations}
          sentRequests={sentRequests}
          setSentRequests={setSentRequests}
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
          {onExitChat && (
            <button
              onClick={onExitChat}
              style={{
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(148,163,184,0.9)",
                width: 36,
                height: 36,
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Back to conversations"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <Avatar
            src={activeChat.avatarSrc}
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
                {!msg.isMe && (() => {
                  const senderId = msg.sender?.toString?.();
                  const participant = (activeChat.conversation?.participants || []).find((p) => {
                    const pid = p?._id ?? p?.id ?? p?.toString?.();
                    return pid && senderId && pid.toString() === senderId.toString();
                  });
                  const src = msg.profilePicture || participant?.profilePicture || activeChat.avatarSrc;
                  const initials = participant?.fullName ? participant.fullName.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : activeChat.avatar;

                  return (
                    <Avatar
                      src={src}
                      initials={initials}
                      color={activeChat.color}
                      size={28}
                      group={activeChat.group}
                    />
                  );
                })()}

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
            <div ref={messagesEndRef} />
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
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {typingUsers.length > 0 && (
                <div style={{ color: 'rgba(148,163,184,0.85)', fontSize: '12px', marginBottom: '6px' }}>
                  {typingUsers.length === 1
                    ? `${typingUsers[0].name || 'Someone'} is typing...`
                    : 'Multiple people are typing...'}
                </div>
              )}

              <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                 gap: "10px",
                }}
               >
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
               placeholder="Type a message..."
               rows={1.6}
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
                borderRadius: "18px",
                background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
                color: "#fff",
                padding: "9px 17px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Send
            </button>
            </div>
            </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

export default memo(ChatArea);
