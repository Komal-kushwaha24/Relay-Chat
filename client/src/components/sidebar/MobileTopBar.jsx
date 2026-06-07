import { motion } from "framer-motion";
import Avatar from "../common/Avatar";

function MobileTopBar({ onMenuOpen, activeChat, onBack, onDeleteConversation }) {
  const handleDeleteConversation = () => {
    if (!activeChat?.id || !onDeleteConversation) return;

    const confirmed = window.confirm(
      "Delete this conversation for you? The other user will still keep their chat."
    );

    if (confirmed) {
      onDeleteConversation(activeChat.id);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "12px 16px",
      background: "rgba(7,18,40,0.9)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(34,211,238,0.07)",
      position: "relative", zIndex: 10, flexShrink: 0,
    }}>
      {/* Left button — back if chat open, hamburger if not */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={activeChat ? onBack : onMenuOpen}
        style={{
          width: 36, height: 36, borderRadius: "10px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(148,163,184,0.8)", flexShrink: 0,
        }}
      >
        {activeChat ? (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        )}
      </motion.button>
 
      {/* Center — active chat info OR brand */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        {activeChat ? (
          <>
            <Avatar src={activeChat.avatarSrc} initials={activeChat.avatar} color={activeChat.color} size={32} online={activeChat.online} group={activeChat.group} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "14px",
                color: "#e2e8f0", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{activeChat.name}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: "11px",
                color: activeChat.online ? "rgba(34,211,238,0.7)" : "rgba(100,116,139,0.5)",
              }}>
                {activeChat.online ? (activeChat.group ? "4 online" : "Active now") : "Offline"}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "8px",
              background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
              boxShadow: "0 0 12px rgba(34,211,238,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
              </svg>
            </div>
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 800,
              fontSize: "17px", color: "#fff", letterSpacing: "-0.03em",
            }}>
              Relay<span style={{ color: "#22d3ee" }}>Chat</span>
            </span>
          </div>
        )}
      </div>
 
      {/* Right action */}
      {activeChat && onDeleteConversation ? (
        <div style={{ display: "flex", gap: "6px" }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleDeleteConversation}
            title="Delete conversation"
            aria-label="Delete conversation"
            style={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              border: "1px solid rgba(248,113,113,0.2)",
              background: "rgba(248,113,113,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      ) : null}
    </div>
  );
}
 
export default MobileTopBar;
