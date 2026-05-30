import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { getUsers, createMessageRequest } from "../../services/api";

function EmptyState({ onOpenSidebar, isMobile, currentUser, conversations = [] }) {
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [activeRequestUserId, setActiveRequestUserId] = useState(null);
  const [requestText, setRequestText] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestNotice, setRequestNotice] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await getUsers();
      const list = res.data?.data ?? res.data ?? [];
      const currentUserId = currentUser?._id ?? currentUser?.id;
      const filtered = Array.isArray(list)
        ? list.filter((user) => (user._id ?? user.id) !== currentUserId)
        : [];
      setUsers(filtered);
    } catch (err) {
      setUsersError(err.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenUsers = async () => {
    setShowUsers(true);
    if (users.length === 0) {
      await fetchUsers();
    }
  };

  const currentUserId = currentUser?._id ?? currentUser?.id;

  const existingParticipantIds = useMemo(() => {
    if (!Array.isArray(conversations) || !currentUserId) return new Set();
    const ids = new Set();
    conversations.forEach((conversation) => {
      (conversation?.participants || []).forEach((participant) => {
        const id = participant?._id ?? participant?.id ?? participant?.toString?.();
        if (id && id !== currentUserId) {
          ids.add(id);
        }
      });
    });
    return ids;
  }, [conversations, currentUserId]);

  const availableUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      const id = user._id ?? user.id;
      return id && !existingParticipantIds.has(id);
    });
  }, [users, existingParticipantIds]);

  const handleSendRequest = async (user) => {
    if (!currentUser?._id && !currentUser?.id) {
      alert("Current user not available. Please login.");
      return;
    }

    const otherId = user._id ?? user.id;
    const trimmed = requestText.trim();

    if (!trimmed) {
      setRequestNotice({ type: "error", text: "Write a message before sending the request." });
      return;
    }

    setSendingRequest(true);
    setRequestNotice(null);
    try {
      await createMessageRequest(otherId, trimmed);
      setRequestNotice({ type: "success", text: `Request sent to ${user.fullName || user.name}.` });
      setRequestText("");
      setActiveRequestUserId(null);
    } catch (err) {
      console.error("Failed to send request", err);
      setRequestNotice({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to send request",
      });
    } finally {
      setSendingRequest(false);
    }
  };

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
          onClick={handleOpenUsers}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Conversation
        </motion.button>
      </div>

      {showUsers && (
        <div
          onClick={() => setShowUsers(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(90vw, 520px)",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: "12px",
              padding: "18px",
              background: "linear-gradient(180deg, rgba(6,10,20,0.98), rgba(7,12,22,0.98))",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 10px 40px rgba(2,6,23,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>Select a user</div>
              <button onClick={() => setShowUsers(false)} style={{ border: "none", background: "transparent", color: "rgba(148,163,184,0.8)", cursor: "pointer" }}>Close</button>
            </div>

            {loadingUsers && <div style={{ color: "rgba(148,163,184,0.8)" }}>Loading users...</div>}
            {usersError && <div style={{ color: "#f87171" }}>{usersError}</div>}
            {requestNotice && (
              <div style={{ color: requestNotice.type === "error" ? "#f87171" : "#22d3ee", marginBottom: 10, fontSize: 13 }}>
                {requestNotice.text}
              </div>
            )}

            {!loadingUsers && availableUsers.length === 0 && !usersError && (
              <div style={{ color: "rgba(148,163,184,0.8)" }}>No users found</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {availableUsers.map((user) => (
                <div key={user._id ?? user.id} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{(user.fullName || user.name || "?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{user.fullName || user.name}</div>
                        <div style={{ color: "rgba(148,163,184,0.7)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const id = user._id ?? user.id;
                        setActiveRequestUserId((current) => current === id ? null : id);
                        setRequestNotice(null);
                      }}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "rgba(34,211,238,0.12)", color: "rgba(34,211,238,0.95)", cursor: "pointer", fontWeight: 600 }}
                    >
                      Message
                    </button>
                  </div>

                  {activeRequestUserId === (user._id ?? user.id) && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <textarea
                        value={requestText}
                        onChange={(event) => setRequestText(event.target.value)}
                        placeholder="Send a message request..."
                        rows={2}
                        style={{
                          flex: 1,
                          resize: "none",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)",
                          color: "#e2e8f0",
                          padding: "9px 10px",
                          outline: "none",
                          fontSize: 13,
                        }}
                      />
                      <button
                        disabled={sendingRequest}
                        onClick={() => handleSendRequest(user)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0ea5e9,#22d3ee)", color: "#fff", cursor: sendingRequest ? "default" : "pointer", fontWeight: 700, opacity: sendingRequest ? 0.7 : 1 }}
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default EmptyState;
