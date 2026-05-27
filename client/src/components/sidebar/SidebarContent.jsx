import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CHATS } from "../../data/chats";

import Avatar from "../common/Avatar";
import SearchBar from "./SearchBar";
import ChatRow from "./ChatRow";

function SidebarContent({
  active,
  setActive,
  search,
  setSearch,
  filtered,
  onChatSelect,
}) {
  const totalUnread = useMemo(() => {
    return CHATS.reduce(
      (sum, chat) => sum + chat.unread,
      0
    );
  }, []);

  const onlineUsers = useMemo(() => {
    return CHATS.filter(
      (chat) => chat.online
    );
  }, []);

  const handleChatClick = (id) => {
    setActive(id);

    if (onChatSelect) {
      onChatSelect();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* TOP BAR */}

      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom:
            "1px solid rgba(255,255,255,0.05)",

          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <motion.div
              whileHover={{
                rotate: [0, -8, 8, 0],
                scale: 1.08,
              }}
              transition={{
                duration: 0.35,
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: "10px",

                background:
                  "linear-gradient(135deg, #0ea5e9, #22d3ee)",

                boxShadow:
                  "0 0 16px rgba(34,211,238,0.35)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="17"
                height="17"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  fill="white"
                />
              </svg>
            </motion.div>

            <div>
              <span
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",

                  fontWeight: 800,
                  fontSize: "18px",
                  color: "#fff",
                }}
              >
                Relay
                <span
                  style={{
                    color: "#22d3ee",
                  }}
                >
                  Chat
                </span>
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "14px",
          }}
        >
          <SearchBar
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* CHAT LIST */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding:
            "4px 10px 10px",
          scrollbarWidth: "none",
        }}
      >
        <AnimatePresence>
          {filtered.map((chat, i) => (
            <motion.div
              key={chat.id}
              initial={{
                opacity: 0,
                x: -12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: i * 0.03,
                duration: 0.25,
              }}
            >
              <ChatRow
                chat={chat}
                active={active === chat.id}
                onClick={handleChatClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ONLINE USERS */}
           
     {/* ONLINE USERS */}

<div
  style={{
    padding: "10px 18px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    flexShrink: 0,
  }}
>
  <div
    style={{
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      color: "rgba(31,92,179,0.8)",
      marginBottom: "10px",
      fontFamily: "'Outfit', sans-serif",
    }}
  >
    ONLINE NOW
  </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {onlineUsers.map((chat) => (
            <Avatar
              key={chat.id}
              initials={chat.avatar}
              color={chat.color}
              size={32}
              online
              group={chat.group}
            />
          ))}
        </div>
      </div>

      {/* Bottom User Profile */}
    <div
    style={{
        marginTop: "auto",
        padding: "16px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    }}
    >
    <div
        style={{
        width: 42,
        height: 42,
        borderRadius: "14px",
        background: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        boxShadow: "0 0 20px rgba(34,211,238,0.3)",
        }}
    >
        Y
    </div>

    <div style={{ flex: 1 }}>
        <div
        style={{
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
        }}
        >
        You
        </div>

        <div
        style={{
            color: "rgba(100,116,139,0.7)",
            fontSize: "12px",
        }}
        >
        Online
        </div>
    </div>
     </div>
    </div>

    
  );
}

export default memo(SidebarContent);
