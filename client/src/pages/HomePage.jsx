import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import useIsMobile from "../hooks/useIsMobile.jsx";

import DesktopSidebar from "../components/sidebar/DesktopSideBar.jsx";
import MobileDrawer from "../components/sidebar/MobileDrawer.jsx";
import MobileTopBar from "../components/sidebar/MobileTopBar.jsx";

import ChatArea from "../components/chat/ChatArea.jsx";
import ProfilePage from "./ProfilePage.jsx";
import { deleteConversation, getCurrentUser, getConversations, getMessageRequests, getSentMessageRequests } from "../services/api.js";
import { getSocket } from "../services/socket.js";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return "#0ea5e9";
  const letters = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hues = [192, 174, 207, 170, 213, 160];
  return `hsl(${letters % 360}, 80%, 55%)`;
};

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversation = (conversation, currentUser, onlineIds = new Set(), typingMap = {}) => {
  const participants = conversation?.participants || [];
  const userId = currentUser?._id ?? currentUser?.id;
  const other = participants.find((participant) => {
    const participantId = participant?._id ?? participant?.id ?? participant?.toString?.();
    return participantId && participantId !== userId;
  });

  const otherId = other?._id ?? other?.id ?? other?.toString?.();
  const name = other?.fullName || other?.email || "Unknown user";
  const avatar = getInitials(name);
  const avatarSrc = other?.profilePicture || null;
  const time = formatTime(conversation?.updatedAt || conversation?.createdAt);
  const convId = conversation._id || conversation.id;
  const rawUnread =
    conversation.unreadCount ??
    (conversation.unreadCounts?.get
      ? conversation.unreadCounts.get(userId)
      : conversation.unreadCounts?.[userId]) ??
    0;

  return {
    id: convId,
    conversation,
    otherId,
    name,
    msg: conversation.lastMessage || "No messages yet",
    typing: Boolean(typingMap[convId]?.length),
    typingNames: typingMap[convId] || [],
    unread: Number(rawUnread),
    time,
    avatar,
    avatarSrc,
    color: getAvatarColor(name),
    online: otherId ? onlineIds.has(otherId) : false,
    group: false,
  };
};

export default function HomePage() {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversationTyping, setConversationTyping] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [messageRequests, setMessageRequests] = useState([]);
  const [sentMessageRequests, setSentMessageRequests] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const conversationsRef = useRef([]);

  const openProfile = () => setShowProfile(true);
  const closeProfile = () => setShowProfile(false);

  const isMobile = useIsMobile(768);

  const conversationParticipantIds = useMemo(() => {
    if (!currentUser) return new Set();
    const ids = new Set();
    conversations.forEach((conversation) => {
      (conversation?.participants || []).forEach((participant) => {
        const id = participant?._id ?? participant?.id ?? participant?.toString?.();
        const currentId = currentUser?._id?.toString() || currentUser?.id?.toString();
        if (id && id !== currentId) {
          ids.add(id.toString());
        }
      });
    });
    return ids;
  }, [conversations, currentUser]);

  const onlineConversationUsers = useMemo(() => {
    return onlineUsers.filter((user) => conversationParticipantIds.has(user.id));
  }, [onlineUsers, conversationParticipantIds]);

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!successToast) return;
    const timeoutId = setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [successToast]);
  useEffect(() => {
    const socket = getSocket();
    const handleConnect = () => {
      console.log("Socket connected");
    };
    const handleDisconnect = () => {
      setOnlineUsers([]);
    };
    const handleOnlineUsers = (users) => {
      const currentId = currentUser?._id?.toString() || currentUser?.id?.toString();
      const online = Array.isArray(users) ? users.filter((user) => user.id !== currentId) : [];
      setOnlineUsers(
        online.map((user) => {
          const name = user.name || user.fullName || user.email || "Unknown user";
          const avatarSrc =
            user.profilePicture ||
            user.avatarSrc ||
            user.profilePic ||
            user.avatarUrl ||
            null;

          return {
            ...user,
            name,
            avatar: getInitials(name),
            color: getAvatarColor(name),
            profilePicture: avatarSrc,
            avatarSrc,
          };
        })
      );
    };

    // conversation update handled by top-level handler

    const handleConversationTyping = (update) => {
      if (!update?.conversationId) return;
      setConversationTyping((prev) => {
        const next = { ...(prev || {}) };
        if (update.isTyping) {
          const arr = next[update.conversationId] || [];
          if (!arr.some((u) => u.userId === update.userId)) {
            next[update.conversationId] = [...arr, { userId: update.userId, name: update.name }];
          }
        } else {
          const arr = (next[update.conversationId] || []).filter((u) => u.userId !== update.userId);
          if (arr.length === 0) delete next[update.conversationId];
          else next[update.conversationId] = arr;
        }
        return next;
      });
    };

    const handleConnectError = (error) => {
      console.error("Socket connection failed", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("online:users", handleOnlineUsers);
    socket.on("conversation:update", handleConversationUpdated);
    socket.on("conversation:typing", handleConversationTyping);
    const handleMessageRequestReceived = (payload) => {
      // add incoming request to local state
      if (!payload) return;
      setMessageRequests((prev) => {
        const requestId = payload._id?.toString?.() || payload.id?.toString?.();
        const payloadSender = payload.from?.toString?.();
        const withoutDuplicate = (prev || []).filter((request) => {
          const existingId = request._id?.toString?.() || request.id?.toString?.();
          const existingSender = request.from?.toString?.();
          return existingId !== requestId && existingSender !== payloadSender;
        });

        return [payload, ...withoutDuplicate];
      });
    };

    const handleMessageRequestCancelled = (payload) => {
      if (!payload?.requestId) return;
      setMessageRequests((prev) =>
        (prev || []).filter((request) => {
          const requestId = request._id?.toString?.() || request.id?.toString?.();
          return requestId !== payload.requestId?.toString?.();
        })
      );
    };

    const handleMessageRequestAccepted = async (payload) => {
      const conversation = payload?.conversation;
      const id = conversation?._id || conversation?.id;
      if (!id) return;

      setSentMessageRequests((prev) =>
        (prev || []).filter((request) => {
          const requestId = request._id?.toString?.() || request.id?.toString?.();
          return requestId !== payload.requestId?.toString?.();
        })
      );
      setConversations((prev) => {
        const exists = (prev || []).some((item) => (item._id || item.id) === id);
        return exists ? prev : [conversation, ...(prev || [])];
      });
    };

    // When the recipient rejects/deletes our request, remove it from
    // sentMessageRequests so the sender can see the "Message" button again
    const handleMessageRequestRejected = (payload) => {
      if (!payload?.requestId) return;
      setSentMessageRequests((prev) =>
        (prev || []).filter((request) => {
          const requestId = request._id?.toString?.() || request.id?.toString?.();
          return requestId !== payload.requestId?.toString?.();
        })
      );
    };

    socket.on('messageRequest:received', handleMessageRequestReceived);
    socket.on('messageRequest:cancelled', handleMessageRequestCancelled);
    socket.on('messageRequest:accepted', handleMessageRequestAccepted);
    socket.on('messageRequest:rejected', handleMessageRequestRejected);
    socket.on('user:updated', (u) => {
      if (!u || !u.id) return;
      const updatedId = u.id || u._id;

      // if the updated user is the current user, refresh local currentUser
      const curId = currentUser?._id?.toString() || currentUser?.id?.toString();
      if (curId && updatedId && updatedId.toString() === curId) {
        setCurrentUser((prev) => ({
          ...prev,
          fullName: u.fullName || prev.fullName,
          email: u.email || prev.email,
          profilePicture: u.profilePicture || prev.profilePicture,
        }));
      }

      // update online users list display
      setOnlineUsers((prev) =>
        (prev || []).map((item) =>
          item.id === updatedId
            ? {
                ...item,
                name: u.fullName || item.name,
                avatar: getInitials(u.fullName || item.name),
                color: getAvatarColor(u.fullName || item.name),
                profilePicture: u.profilePicture || item.profilePicture,
                avatarSrc: u.profilePicture || u.avatarSrc || item.avatarSrc || null,
              }
            : item
        )
      );

      // update cached conversations so avatars refresh immediately
      setConversations((prev) =>
        (prev || []).map((conversation) => {
          const participants = (conversation.participants || []).map((participant) => {
            const participantId = participant?._id ?? participant?.id ?? participant?.toString?.();
            if (participantId && participantId.toString() === updatedId.toString()) {
              return {
                ...participant,
                fullName: u.fullName || participant.fullName,
                email: u.email || participant.email,
                profilePicture: u.profilePicture || participant.profilePicture,
              };
            }
            return participant;
          });

          return { ...conversation, participants };
        })
      );
    });
    socket.on("connect_error", handleConnectError);

    if (currentUser) {
      socket.connect();
      // fetch existing requests
      (async () => {
        try {
          const res = await getMessageRequests();
          setMessageRequests(res.data?.data || []);
          const sentRes = await getSentMessageRequests();
          setSentMessageRequests(sentRes.data?.data || []);
        } catch {
          // ignore
        }
      })();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("online:users", handleOnlineUsers);
      socket.off("conversation:update", handleConversationUpdated);
      socket.off("conversation:typing", handleConversationTyping);
      socket.off('messageRequest:received', handleMessageRequestReceived);
      socket.off('messageRequest:cancelled', handleMessageRequestCancelled);
      socket.off('messageRequest:accepted', handleMessageRequestAccepted);
      socket.off('messageRequest:rejected', handleMessageRequestRejected);
      socket.off('user:updated');
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [currentUser]);

  const sortConversations = (items = []) =>
    [...items].sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      const aTyping = Boolean(conversationTyping?.[aId]?.length);
      const bTyping = Boolean(conversationTyping?.[bId]?.length);

      if (aTyping && !bTyping) return -1;
      if (!aTyping && bTyping) return 1;

      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const handleConversationUpdated = (update) => {
    if (!update?.conversationId) return;
    const currentId = currentUser?._id?.toString() || currentUser?.id?.toString();

    setConversations((prevConversations) =>
      sortConversations(
        prevConversations.map((conversation) => {
          const conversationId = conversation._id || conversation.id;
          if (conversationId !== update.conversationId) {
            return conversation;
          }

          const currentId = currentUser?._id?.toString() || currentUser?.id?.toString();
          const unreadCounts = { ...(conversation.unreadCounts || {}) };
          if (update.unreadCount != null && currentId) {
            unreadCounts[currentId] = update.unreadCount;
          }

          return {
            ...conversation,
            lastMessage: update.lastMessage ?? conversation.lastMessage,
            updatedAt: update.updatedAt ?? conversation.updatedAt,
            unreadCounts,
          };
        })
      )
    );
  };

  const reloadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(sortConversations(res.data?.data ?? res.data ?? []));
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getCurrentUser();
        if (!mounted) return;

        const current =
          res.data?.user ?? res.data?.data ?? res.data ?? null;
        setCurrentUser(current);
        await reloadConversations();
      } catch (err) {
        console.error("Failed to fetch current user or conversations", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const chats = useMemo(() => {
    if (!currentUser) return [];
    const onlineIds = new Set(onlineConversationUsers.map((user) => user.id));
    return sortConversations(conversations).map((conversation) =>
      formatConversation(conversation, currentUser, onlineIds, conversationTyping)
    );
  }, [conversations, currentUser, onlineConversationUsers, conversationTyping]);

  const filteredChats = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return chats;

    const tokens = q.split(/\s+/).filter(Boolean);

    return chats.filter((chat) => {
      const name = (chat.name || "").toLowerCase();
      const words = name.split(/\s+/).filter(Boolean);

      // require every token to match start of any word in the name
      return tokens.every((token) =>
        words.some((w) => w.startsWith(token))
      );
    });
  }, [search, chats]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeId) || null,
    [chats, activeId]
  );

  const handleOpenConversationById = async (conversationId) => {
    if (!conversationId) return;
    setActiveId(conversationId);
    await reloadConversations();
  };

  const requestDeleteConversation = (conversationId) => {
    if (!conversationId) return;
    setChatToDelete(conversationId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConversation = async () => {
    if (!chatToDelete || isDeletingConversation) return;

    setIsDeletingConversation(true);
    try {
      await deleteConversation(chatToDelete);
      setConversations((prev) =>
        (prev || []).map((conversation) => {
          const id = conversation._id?.toString?.() || conversation.id?.toString?.();
          if (id === chatToDelete?.toString?.()) {
            return {
              ...conversation,
              lastMessage: "",
            };
          }
          return conversation;
        })
      );
      setSuccessToast("Conversation deleted successfully");
    } catch (err) {
      console.error("Failed to delete conversation", err);
      alert(err.response?.data?.message || err.message || "Failed to delete conversation");
    } finally {
      setIsDeletingConversation(false);
      setShowDeleteConfirm(false);
      setChatToDelete(null);
    }
  };

  const handleRequestAccepted = async (conversation) => {
    const id = conversation?._id || conversation?.id;
    if (!id) return;

    setConversations((prev) => {
      const exists = (prev || []).some((item) => (item._id || item.id) === id);
      return sortConversations(exists ? prev : [conversation, ...(prev || [])]);
    });
    setActiveId(id);
    await reloadConversations();
  };

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 140% 100% at 50% -10%, #071428 0%, #050d1e 40%, #030810 100%)",
        }}
      />

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
          <MobileDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            active={activeId}
            setActive={setActiveId}
            search={search}
            setSearch={setSearch}
            filtered={filteredChats}
            currentUser={currentUser}
            onlineUsers={onlineConversationUsers}
            onProfileOpen={openProfile}
            onUserClick={handleOpenConversationById}
            messageRequestCount={messageRequests.length}
            messageRequests={messageRequests}
            setMessageRequests={setMessageRequests}
            onRequestAccepted={handleRequestAccepted}
          />

          <MobileTopBar
            onMenuOpen={() => setDrawerOpen(true)}
            activeChat={activeChat}
            onBack={() => setActiveId(null)}
            onDeleteConversation={requestDeleteConversation}
          />

          <div className="flex-1 overflow-hidden">
            <ChatArea
              activeChat={activeChat}
              isMobile={true}
              onOpenSidebar={() => setDrawerOpen(true)}
              currentUser={currentUser}
              conversations={conversations}
              onConversationUpdated={handleConversationUpdated}
              onConversationDeleted={requestDeleteConversation}
              sentRequests={sentMessageRequests}


              setSentRequests={setSentMessageRequests}
              onExitChat={() => setActiveId(null)}
            />
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-screen overflow-hidden">
          <DesktopSidebar
            active={activeId}
            setActive={setActiveId}
            search={search}
            setSearch={setSearch}
            filtered={filteredChats}
            currentUser={currentUser}
            onlineUsers={onlineConversationUsers}
            onProfileOpen={openProfile}
            onUserClick={handleOpenConversationById}
            messageRequestCount={messageRequests.length}
            messageRequests={messageRequests}
            setMessageRequests={setMessageRequests}
            onRequestAccepted={handleRequestAccepted}
          />

          <div className="flex-1 overflow-hidden">
            <ChatArea
              activeChat={activeChat}
              isMobile={false}
              currentUser={currentUser}
              conversations={conversations}
              onConversationUpdated={handleConversationUpdated}
              onConversationDeleted={requestDeleteConversation}
              sentRequests={sentMessageRequests}
              setSentRequests={setSentMessageRequests}
              onExitChat={() => setActiveId(null)}
            />
          </div>
        </div>
      )}

      {showProfile && (
        <ProfilePage
          mode={isMobile ? "modal" : "overlay"}
          onClose={closeProfile}
          onProfileUpdated={(u) => setCurrentUser(u)}
        />
      )}

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0f172a', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>Delete Conversation</h3>
            <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
              Delete this conversation for you? The other user will still keep their chat.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                disabled={isDeletingConversation}
                style={{ 
                  padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', 
                  color: '#fff', border: 'none', cursor: isDeletingConversation ? 'wait' : 'pointer',
                  fontWeight: '600', transition: 'background 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteConversation} 
                disabled={isDeletingConversation}
                style={{ 
                  padding: '10px 16px', borderRadius: '8px', background: '#ef4444', 
                  color: '#fff', border: 'none', cursor: isDeletingConversation ? 'wait' : 'pointer',
                  fontWeight: '600', transition: 'background 0.2s'
                }}
              >
                {isDeletingConversation ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 18px",
              borderRadius: "14px",
              background: "rgba(7,18,40,0.94)",
              border: "1px solid rgba(34,211,238,0.25)",
              boxShadow: "0 0 24px rgba(34,211,238,0.15)",
              color: "#e2e8f0",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            <span style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {successToast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
