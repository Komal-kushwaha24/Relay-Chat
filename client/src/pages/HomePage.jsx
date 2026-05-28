import { useState, useEffect, useMemo } from "react";

import { CHATS } from "../data/chats";

import useIsMobile from "../hooks/useIsMobile";

import DesktopSidebar from "../components/sidebar/DesktopSidebar";
import MobileDrawer from "../components/sidebar/MobileDrawer";
import MobileTopBar from "../components/sidebar/MobileTopBar";

import ChatArea from "../components/chat/ChatArea";

export default function HomePage() {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = useIsMobile(768);

  const filteredChats = useMemo(() => {
    const q = search.toLowerCase();

    return CHATS.filter(
      (chat) =>
        chat.name.toLowerCase().includes(q) ||
        chat.msg.toLowerCase().includes(q)
    );
  }, [search]);

  const activeChat = useMemo(
    () => CHATS.find((chat) => chat.id === activeId) || null,
    [activeId]
  );

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    let mounted = true;
    import("../services/api").then(({ getCurrentUser }) => {
      (async () => {
        try {
          const res = await getCurrentUser();
          if (!mounted) return;
          // server may return { user } or { data: { ... } } shapes
          setCurrentUser(res.data?.user ?? res.data?.data ?? res.data ?? null);
        } catch (err) {
          console.error("Failed to fetch current user", err);
        }
      })();
    });

    return () => (mounted = false);
  }, []);

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
            />
          </div>
        </div>
      )}
    </>
  );
}