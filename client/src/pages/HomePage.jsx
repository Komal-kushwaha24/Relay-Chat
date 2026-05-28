import { useState, useEffect, useMemo } from "react";

import useIsMobile from "../hooks/useIsMobile";

import DesktopSidebar from "../components/sidebar/DesktopSidebar";
import MobileDrawer from "../components/sidebar/MobileDrawer";
import MobileTopBar from "../components/sidebar/MobileTopBar";

import ChatArea from "../components/chat/ChatArea";
import { getCurrentUser, getConversations } from "../services/api";

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

const formatConversation = (conversation, currentUser) => {
  const participants = conversation?.participants || [];
  const userId = currentUser?._id ?? currentUser?.id;
  const other = participants.find((participant) => {
    const participantId = participant?._id ?? participant?.id ?? participant?.toString?.();
    return participantId && participantId !== userId;
  });

  const name = other?.fullName || other?.email || "Unknown user";
  const avatar = getInitials(name);
  const time = formatTime(conversation?.updatedAt || conversation?.createdAt);

  return {
    id: conversation._id || conversation.id,
    conversation,
    name,
    msg: conversation.lastMessage || "No messages yet",
    time,
    avatar,
    color: getAvatarColor(name),
    online: false,
    group: false,
  };
};

export default function HomePage() {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  const reloadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data?.data ?? res.data ?? []);
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
    return conversations.map((conversation) =>
      formatConversation(conversation, currentUser)
    );
  }, [conversations, currentUser]);

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
      return [conversation, ...(prev || [])];
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
              onConversationUpdated={reloadConversations}
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
          />

          <div className="flex-1 overflow-hidden">
            <ChatArea
              activeChat={activeChat}
              isMobile={false}
              currentUser={currentUser}
              onConversationUpdated={reloadConversations}
              onConversationCreated={handleConversationCreated}
              onExitChat={() => setActiveId(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}