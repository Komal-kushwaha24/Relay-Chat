import { motion } from "framer-motion";
import Avatar from "../common/Avatar";

function MobileTopBar({ onMenuOpen, activeChat, onBack }) {
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
            <Avatar initials={activeChat.avatar} color={activeChat.color} size={32} online={activeChat.online} group={activeChat.group} />
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
      {activeChat ? (
        <div style={{ display: "flex", gap: "6px" }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(100,116,139,0.6)",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .14h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
            </svg>
          </motion.button>
        </div>
      ) : null}
    </div>
  );
}
 
export default MobileTopBar;