import { memo, useMemo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import Avatar from "../common/Avatar";
import EmptyState from "./EmptyState";
import { editMessage, getMessages, sendMessage, undoMessage } from "../../services/api";
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

const removeMessageById = (existing = [], messageId) =>
  existing.filter((message) => getMessageId(message) !== messageId?.toString?.());

const updateMessageById = (existing = [], incoming) =>
  existing.map((message) =>
    getMessageId(message) === getMessageId(incoming)
      ? { ...message, ...incoming }
      : message
  );

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
  const [undoingIds, setUndoingIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [savingEditId, setSavingEditId] = useState(null);
  const socket = getSocket();
  const messagesEndRef = useRef(null);
  const onConversationUpdatedRef = useRef(onConversationUpdated);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteMenuId, setDeleteMenuId] = useState(null);
  useEffect(() => {
    onConversationUpdatedRef.current = onConversationUpdated;
  }, [onConversationUpdated]);

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

    const handleDeletedMessage = (payload) => {
      if (!payload || payload.roomId !== roomId || !payload.messageId) {
        return;
      }

      setMessages((prev) => removeMessageById(prev, payload.messageId));
      if (payload.conversation && onConversationUpdatedRef.current) {
        onConversationUpdatedRef.current(payload.conversation);
      }
    };

    const handleUpdatedMessage = (payload) => {
      if (!payload || payload.roomId !== roomId || !payload.message) {
        return;
      }

      setMessages((prev) => updateMessageById(prev, payload.message));
      if (payload.conversation && onConversationUpdatedRef.current) {
        onConversationUpdatedRef.current(payload.conversation);
      }
    };

    socket.emit("chat:join", roomId, (response) => {
      if (!response?.success) {
        console.error("Failed to join chat room", response?.message);
      }
    });

    socket.on("chat:message", handleIncomingMessage);
    socket.on("chat:typing", handleIncomingTyping);
    socket.on("chat:message:deleted", handleDeletedMessage);
    socket.on("chat:message:updated", handleUpdatedMessage);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
      socket.off("chat:typing", handleIncomingTyping);
      socket.off("chat:message:deleted", handleDeletedMessage);
      socket.off("chat:message:updated", handleUpdatedMessage);
      setTypingUsers([]);
      socket.emit("chat:leave", roomId);
    };
  }, [activeChat?.id, socket, currentUser]);

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

  const emitUndoMessage = (payload) =>
    new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error("Socket is not connected"));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error("No acknowledgment from server"));
      }, 5000);

      socket.emit("chat:message:undo", payload, (response) => {
        clearTimeout(timeoutId);

        if (!response) {
          reject(new Error("No acknowledgment from server"));
          return;
        }

        if (!response.success) {
          reject(new Error(response.message || "Failed to undo message"));
          return;
        }

        resolve(response.data);
      });
    });

  const emitEditMessage = (payload) =>
    new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error("Socket is not connected"));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error("No acknowledgment from server"));
      }, 5000);

      socket.emit("chat:message:edit", payload, (response) => {
        clearTimeout(timeoutId);

        if (!response) {
          reject(new Error("No acknowledgment from server"));
          return;
        }

        if (!response.success) {
          reject(new Error(response.message || "Failed to edit message"));
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

  const handleUndoMessage = async (message, type = 'everyone') => {
    const messageId = getMessageId(message);
    if (!messageId || !activeChat || message.pending) return;

    setSendError(null);
    setUndoingIds((prev) => new Set(prev).add(messageId));

    try {
      const result = await emitUndoMessage({
        roomId: activeChat.id,
        messageId,
        type,
      });

      setMessages((prev) => removeMessageById(prev, messageId));
      if (result?.conversation && onConversationUpdated) {
        onConversationUpdated(result.conversation);
      }
    } catch (err) {
      if (!socket?.connected) {
        try {
          const res = await undoMessage(messageId, type);
          const deleted = res.data?.data;
          setMessages((prev) => removeMessageById(prev, messageId));
          if (deleted && onConversationUpdated) {
            onConversationUpdated({
              conversationId: deleted.conversationId,
              lastMessage: deleted.lastMessage,
              updatedAt: deleted.updatedAt,
            });
          }
        } catch (apiErr) {
          console.error("Failed to undo message", apiErr);
          setSendError(
            apiErr.response?.data?.message || apiErr.message || err.message || "Failed to undo message"
          );
        }
      } else {
        console.error("Failed to undo message", err);
        setSendError(err.message || "Failed to undo message");
      }
    } finally {
      setUndoingIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const startEditingMessage = (message) => {
    if (!message?.isMe || message.pending) return;
    setSendError(null);
    setEditingId(getMessageId(message));
    setEditingText(message.text || "");
  };

  const cancelEditingMessage = () => {
    setEditingId(null);
    setEditingText("");
    setSavingEditId(null);
  };

  const handleSaveEditedMessage = async (message) => {
    const messageId = getMessageId(message);
    const trimmed = editingText.trim();
    if (!messageId || !activeChat || !trimmed || trimmed === (message.text || "").trim()) {
      cancelEditingMessage();
      return;
    }

    setSendError(null);
    setSavingEditId(messageId);

    try {
      const result = await emitEditMessage({
        roomId: activeChat.id,
        messageId,
        text: trimmed,
      });

      if (result?.message) {
        setMessages((prev) => updateMessageById(prev, result.message));
      }
      if (result?.conversation && onConversationUpdated) {
        onConversationUpdated(result.conversation);
      }
      cancelEditingMessage();
    } catch (err) {
      if (!socket?.connected) {
        try {
          const res = await editMessage(messageId, trimmed);
          const result = res.data?.data;
          if (result?.message) {
            setMessages((prev) => updateMessageById(prev, result.message));
          }
          if (result?.conversation && onConversationUpdated) {
            onConversationUpdated(result.conversation);
          }
          cancelEditingMessage();
        } catch (apiErr) {
          console.error("Failed to edit message", apiErr);
          setSendError(
            apiErr.response?.data?.message || apiErr.message || err.message || "Failed to edit message"
          );
        }
      } else {
        console.error("Failed to edit message", err);
        setSendError(err.message || "Failed to edit message");
      }
    } finally {
      setSavingEditId(null);
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
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: msg.isMe ? "row-reverse" : "row" }}>
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
                      {editingId === getMessageId(msg) ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: isMobile ? 180 : 260 }}>
                          <textarea
                            value={editingText}
                            onChange={(event) => setEditingText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleSaveEditedMessage(msg);
                              }
                              if (event.key === "Escape") {
                                cancelEditingMessage();
                              }
                            }}
                            rows={2}
                            autoFocus
                            style={{
                              width: "100%",
                              resize: "none",
                              border: "1px solid rgba(255,255,255,0.22)",
                              borderRadius: "10px",
                              background: "rgba(3,8,16,0.22)",
                              color: "#fff",
                              padding: "8px 9px",
                              outline: "none",
                              fontFamily: "'Inter', sans-serif",
                              fontSize: isMobile ? "13px" : "13.5px",
                              lineHeight: 1.45,
                            }}
                          />
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={cancelEditingMessage}
                              style={{
                                border: "1px solid rgba(255,255,255,0.14)",
                                borderRadius: "9px",
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.84)",
                                padding: "5px 9px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditedMessage(msg)}
                              disabled={savingEditId === getMessageId(msg)}
                              style={{
                                border: "none",
                                borderRadius: "9px",
                                background: "rgba(255,255,255,0.92)",
                                color: "#075985",
                                padding: "5px 10px",
                                cursor: savingEditId === getMessageId(msg) ? "wait" : "pointer",
                                fontSize: "11px",
                                fontWeight: 800,
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {msg.isMe && !msg.pending && editingId !== getMessageId(msg) && (
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <button
                          onClick={() => {
                            setOpenMenuId(openMenuId === getMessageId(msg) ? null : getMessageId(msg));
                            setDeleteMenuId(null);
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            border: "none",
                            background: "transparent",
                            color: "rgba(226,232,240,0.78)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label="Message options"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        
                        {openMenuId === getMessageId(msg) && (
                          <div style={{
                            position: "absolute",
                            right: "32px",
                            top: 0,
                            display: "flex",
                            flexDirection: "row",
                            gap: "5px",
                            background: "rgba(7,18,40,0.95)",
                            padding: "4px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            zIndex: 10,
                          }}>
                            {deleteMenuId !== getMessageId(msg) ? (
                              <>
                                <button
                                  onClick={() => { startEditingMessage(msg); setOpenMenuId(null); }}
                                  title="Edit message"
                                  style={{
                                    width: 28,
                                    height: 28,
                                    border: "none",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "rgba(226,232,240,0.78)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  aria-label="Edit message"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteMenuId(getMessageId(msg))}
                                  title="Delete message"
                                  style={{
                                    width: 28,
                                    height: 28,
                                    border: "none",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "rgba(226,232,240,0.78)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  aria-label="Delete message options"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { handleUndoMessage(msg, 'me'); setOpenMenuId(null); setDeleteMenuId(null); }}
                                  disabled={undoingIds.has(getMessageId(msg))}
                                  title="Delete for me"
                                  style={{
                                    border: "none",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.05)",
                                    color: undoingIds.has(getMessageId(msg)) ? "rgba(148,163,184,0.45)" : "rgba(226,232,240,0.78)",
                                    cursor: undoingIds.has(getMessageId(msg)) ? "wait" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    fontFamily: "'Inter', sans-serif",
                                    whiteSpace: "nowrap",
                                  }}
                                  aria-label="Delete for me"
                                >
                                  For me
                                </button>
                                <button
                                  onClick={() => { handleUndoMessage(msg, 'everyone'); setOpenMenuId(null); setDeleteMenuId(null); }}
                                  disabled={undoingIds.has(getMessageId(msg))}
                                  title="Delete for everyone"
                                  style={{
                                    border: "none",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.05)",
                                    color: undoingIds.has(getMessageId(msg)) ? "rgba(148,163,184,0.45)" : "#ef4444",
                                    cursor: undoingIds.has(getMessageId(msg)) ? "wait" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    fontFamily: "'Inter', sans-serif",
                                    whiteSpace: "nowrap",
                                  }}
                                  aria-label="Delete for everyone"
                                >
                                  For everyone
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
