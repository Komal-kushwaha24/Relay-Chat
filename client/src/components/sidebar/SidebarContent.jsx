import {
  memo,
  useMemo,
   useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import Avatar from "../common/Avatar";
import SearchBar from "./SearchBar";
import ChatRow from "./ChatRow";
import { logoutUser } from "../../services/api";
import { getUsers } from "../../services/api";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function SidebarContent({
  active,
  setActive,
  search,
  setSearch,
  filtered,
  onChatSelect,
  currentUser,
  onlineUsers = [],
  onUserClick,
}) {
  const handleChatClick = (id) => {
    setActive(id);

    if (onChatSelect) {
      onChatSelect();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const myInitials = useMemo(() => {
    return getInitials(currentUser?.fullName);
  }, [currentUser]);

  const [showNewChat, setShowNewChat] =
  useState(false);


    const [users, setUsers] =
      useState([]);

    const [loadingUsers, setLoadingUsers] =
      useState(false);

const fetchUsers = async () => {
  try {
    setLoadingUsers(true);

    const response =
      await getUsers();

    console.log(response.data);

    setUsers(
      response.data.users || []
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingUsers(false);
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

       <button
         onClick={() =>
           setShowNewChat(true)
          }
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "10px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background:
              "linear-gradient(135deg,#0ea5e9,#22d3ee)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          + New Chat
        </button>

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
            color: "rgba(34,211,238,0.8)",
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
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                if (onUserClick) onUserClick(user.id);
                if (onChatSelect) onChatSelect();
              }}
              style={{ cursor: "pointer" }}
              title={`Start chat with ${user.name}`}
            >
              <Avatar
                initials={user.avatar}
                color={user.color}
                size={32}
                online
              />
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "rgba(100,116,139,0.5)",
                padding: "4px 0",
              }}
            >
              No other users registered
            </div>
          )}
        </div>
      </div>


      {showNewChat && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background:
        "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        width: "320px",
        background: "#0f172a",
        borderRadius: "20px",
        padding: "20px",
        border:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            color: "#fff",
            margin: 0,
          }}
        >
          Start New Chat
        </h3>

        <button
          onClick={() =>
            setShowNewChat(false)
          }
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          color:
            "rgba(255,255,255,0.7)",
          fontSize: "14px",
        }}
      >
        Users list will come here
      </div>
    </div>
  </div>
)}

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
          {myInitials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentUser?.fullName || "You"}
          </div>

          <div
            style={{
              color: "rgba(34,211,238,0.7)",
              fontSize: "11px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Online
          </div>
        </div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.1, color: "#f43f5e" }}
          whileTap={{ scale: 0.95 }}
          style={{
            border: "none",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(148,163,184,0.7)",
            padding: "8px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Logout"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

export default memo(SidebarContent);
