import { motion } from "framer-motion";
import { useState } from "react";

function EmptyState({ onOpenSidebar, isMobile }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px",
    }}>
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 32 }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.06, 0.15] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
            style={{
              position: "absolute", inset: -(i * 20), borderRadius: "50%",
              border: `1px solid rgba(34,211,238,${0.25 - i * 0.07})`,
            }}
          />
        ))}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, rgba(14,165,233,0.18), rgba(34,211,238,0.05))",
            border: "1px solid rgba(34,211,238,0.2)",
            boxShadow: "0 0 40px rgba(34,211,238,0.1), inset 0 1px 0 rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24">
            <motion.path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              fill="rgba(34,211,238,0.2)" stroke="rgba(34,211,238,0.7)" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
            {[9, 12, 15].map((cx, i) => (
              <motion.circle key={cx} cx={cx} cy="10" r="1" fill="rgba(34,211,238,0.8)"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1.2 + i * 0.15 }} />
            ))}
          </svg>
        </motion.div>
      </div>
 
      <motion.h2
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "20px",
          color: "#e2e8f0", letterSpacing: "-0.03em", marginBottom: "8px", textAlign: "center",
        }}
      >
        {isMobile ? "Your messages" : "Select a chat to start messaging"}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{
          fontFamily: "'Inter', sans-serif", fontSize: "13px",
          color: "rgba(100,116,139,0.7)", fontWeight: 300,
          textAlign: "center", lineHeight: 1.7, maxWidth: "260px",
        }}
      >
        {isMobile
          ? "Tap the menu to browse your conversations."
          : "Choose a conversation from the sidebar or start a new one."}
      </motion.p>
 
      <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap", justifyContent: "center" }}>
        {isMobile && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onOpenSidebar}
            style={{
              padding: "10px 22px", borderRadius: "12px", border: "1px solid rgba(34,211,238,0.25)",
              background: "rgba(14,165,233,0.1)", cursor: "pointer",
              color: "rgba(34,211,238,0.85)", fontFamily: "'Outfit', sans-serif",
              fontWeight: 600, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "7px",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
            Open Conversations
          </motion.button>
        )}
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isMobile ? 0.7 : 0.6 }}
          whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(34,211,238,0.35)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "10px 22px", borderRadius: "12px", border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
            color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px",
            boxShadow: "0 0 20px rgba(34,211,238,0.25)",
            display: "flex", alignItems: "center", gap: "7px",
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Conversation
        </motion.button>
      </div>
    </div>
  );
}
 
export default EmptyState;