import { motion, AnimatePresence } from "framer-motion";
import SidebarContent from "./SidebarContent";

function MobileDrawer({
  open,
  onClose,
  active,
  setActive,
  search,
  setSearch,
  filtered,
  currentUser,
  onlineUsers,
  onUserClick,
  onProfileOpen,
  messageRequestCount = 0,
  messageRequests = [],
  setMessageRequests,
  onRequestAccepted,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(2,8,16,0.7)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0,
              width: "min(80vw, 300px)", zIndex: 50,
              background: "rgba(7,18,40,0.97)",
              backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
              borderRight: "1px solid rgba(34,211,238,0.12)",
              boxShadow: "8px 0 40px rgba(0,0,0,0.6), 2px 0 0 rgba(34,211,238,0.06)",
            }}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, color: "rgba(34,211,238,0.9)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                position: "absolute", top: "14px", right: "14px", zIndex: 10,
                width: 28, height: 28, borderRadius: "8px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(100,116,139,0.7)",
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
 
            <SidebarContent
              active={active}
              setActive={setActive}
              search={search}
              setSearch={setSearch}
              filtered={filtered}
              onChatSelect={onClose}
              currentUser={currentUser}
              onlineUsers={onlineUsers}
              onUserClick={onUserClick}
              onProfileOpen={() => {
                onClose();
                if (onProfileOpen) onProfileOpen();
              }}
              messageRequestCount={messageRequestCount}
              messageRequests={messageRequests}
              setMessageRequests={setMessageRequests}
              onRequestAccepted={onRequestAccepted}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileDrawer;
 
