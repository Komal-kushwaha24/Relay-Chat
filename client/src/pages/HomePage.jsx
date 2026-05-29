import { useState, useEffect, useMemo } from "react";

import useIsMobile from "../hooks/useIsMobile";

import DesktopSidebar from "../components/sidebar/DesktopSidebar";
import MobileDrawer from "../components/sidebar/MobileDrawer";
import MobileTopBar from "../components/sidebar/MobileTopBar";

import ChatArea from "../components/chat/ChatArea";
import ProfilePage from "./ProfilePage";
import { getCurrentUser, getConversations } from "../services/api";
import { getSocket } from "../services/socket";

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
        online.map((user) => ({
          ...user,
          avatar: getInitials(user.name),
          color: getAvatarColor(user.name),
          profilePicture: user.profilePicture || null,
        }))
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
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("online:users", handleOnlineUsers);
      socket.off("conversation:update", handleConversationUpdated);
      socket.off("conversation:typing", handleConversationTyping);
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
    const q = search.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(q) ||
        chat.msg.toLowerCase().includes(q)
    );
  }, [search, chats]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeId) || null,
    [chats, activeId]
  );

  const handleConversationCreated = async (conversation) => {
    const id = conversation?._id || conversation?.id;
    if (!id) return;

    setActiveId(id);
    setConversations((prev) => {
      const existing = prev?.find(
        (item) => (item._id ?? item.id) === id
      );
      if (existing) return prev;
      return sortConversations([conversation, ...(prev || [])]);
    });

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
          />

          <MobileTopBar
            onMenuOpen={() => setDrawerOpen(true)}
            activeChat={activeChat}
            onBack={() => setActiveId(null)}
          />

          <div className="flex-1 overflow-hidden">
            <ChatArea
              activeChat={activeChat}
              isMobile={true}
              onOpenSidebar={() => setDrawerOpen(true)}
              currentUser={currentUser}
              conversations={conversations}
              onConversationUpdated={handleConversationUpdated}
              onConversationCreated={handleConversationCreated}
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
          />

          <div className="flex-1 overflow-hidden">
            <ChatArea
              activeChat={activeChat}
              isMobile={false}
              currentUser={currentUser}
              conversations={conversations}
              onConversationUpdated={handleConversationUpdated}
              onConversationCreated={handleConversationCreated}
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
    </>
  );
}