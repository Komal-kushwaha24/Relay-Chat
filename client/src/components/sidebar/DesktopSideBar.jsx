import { motion } from "framer-motion";
import SidebarContent from "./SidebarContent.jsx";

function DesktopSidebar({
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
    <motion.div
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: "280px", flexShrink: 0, position: "relative",
        background: "rgba(7,18,40,0.82)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(34,211,238,0.07)",
        height: "100%", zIndex: 2,
      }}
    >
      <SidebarContent
        active={active}
        setActive={setActive}
        search={search}
        setSearch={setSearch}
        filtered={filtered}
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        onUserClick={onUserClick}
        onProfileOpen={onProfileOpen}
        messageRequestCount={messageRequestCount}
        messageRequests={messageRequests}
        setMessageRequests={setMessageRequests}
        onRequestAccepted={onRequestAccepted}
      />
    </motion.div>
  );
}

export default DesktopSidebar;
