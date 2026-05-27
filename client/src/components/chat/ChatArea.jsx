import { memo, useMemo } from "react";
import { motion } from "framer-motion";

import Avatar from "../common/Avatar";
import EmptyState from "./EmptyState";

const ACTION_ICONS = [
//   {
//     id: "phone",
//     icon: (
//       <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .14h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
//     ),
//   },
//   {
//     id: "video",
//     icon: (
//       <>
//         <circle cx="23" cy="7" r="4" />
//         <path d="M17 3H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
//       </>
//     ),
//   },
];

function ChatArea({ activeChat, isMobile, onOpenSidebar }) {
  const messages = useMemo(
    () => [
      {
        from: "them",
        text: activeChat?.msg,
        time: `${activeChat?.time} ago`,
      },
      {
        from: "me",
        text: "Got it! Let me take a look 👀",
        time: "just now",
      },
    ],
    [activeChat]
  );

  if (!activeChat) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <EmptyState
          onOpenSidebar={onOpenSidebar}
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <motion.div
      key={activeChat.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex h-full flex-1 flex-col overflow-hidden"
    >
      {/* Desktop Header */}
      {!isMobile && (
        <div
          className="flex items-center gap-3 border-b px-6 py-[14px]"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "rgba(7,18,40,0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Avatar
            initials={activeChat.avatar}
            color={activeChat.color}
            size={38}
            online={activeChat.online}
            group={activeChat.group}
          />

          <div className="flex-1">
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                color: "#e2e8f0",
                letterSpacing: "-0.02em",
              }}
            >
              {activeChat.name}
            </div>

            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: activeChat.online
                  ? "rgba(34,211,238,0.7)"
                  : "rgba(100,116,139,0.5)",
              }}
            >
              {activeChat.online
                ? activeChat.group
                  ? "4 members online"
                  : "Active now"
                : "Offline"}
            </div>
          </div>

          <div className="flex gap-2">
            {ACTION_ICONS.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{
                  scale: 1.1,
                  color: "rgba(34,211,238,0.9)",
                }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-[9px]"
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(100,116,139,0.6)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex flex-1 flex-col overflow-y-auto"
        style={{
          padding: isMobile ? "16px 14px" : "24px",
          scrollbarWidth: "none",
        }}
      >
        {/* THIS FIXES BOTTOM STICK */}
        <div className="mt-auto flex flex-col gap-4">
          
          {/* Date Divider */}
          <div className="my-2 flex items-center gap-3">
            <div
              className="flex-1"
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.05)",
              }}
            />

            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "rgba(100,116,139,0.45)",
                padding: "3px 10px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              Today
            </span>

            <div
              className="flex-1"
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.05)",
              }}
            />
          </div>

          {/* Messages */}
          {messages.map((msg, i) => {
            const isMe = msg.from === "me";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`flex items-end gap-2 ${
                  isMe ? "flex-row-reverse" : ""
                }`}
              >
                {!isMe && (
                  <Avatar
                    initials={activeChat.avatar}
                    color={activeChat.color}
                    size={28}
                    group={activeChat.group}
                  />
                )}

                <div
                  style={{
                    maxWidth: isMobile ? "75%" : "60%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isMe
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      background: isMe
                        ? "linear-gradient(135deg, #0ea5e9, #0891b2)"
                        : "rgba(255,255,255,0.06)",
                      border: isMe
                        ? "none"
                        : "1px solid rgba(255,255,255,0.07)",
                      boxShadow: isMe
                        ? "0 0 16px rgba(14,165,233,0.25)"
                        : "none",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: isMobile ? "13px" : "13.5px",
                      color: isMe ? "#fff" : "#cbd5e1",
                      fontWeight: 300,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>

                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      color: "rgba(100,116,139,0.45)",
                      marginTop: "4px",
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-end gap-2"
          >
            <Avatar
              initials={activeChat.avatar}
              color={activeChat.color}
              size={28}
              group={activeChat.group}
            />

            <div
              className="flex items-center gap-1"
              style={{
                padding: "10px 14px",
                borderRadius: "16px 16px 16px 4px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "rgba(34,211,238,0.6)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Input */}
      <div
        style={{
          padding: isMobile ? "10px 12px" : "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(7,18,40,0.6)",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center gap-[10px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "8px 10px 8px 16px",
          }}
        >
          <input
            placeholder={`Message ${activeChat.name}…`}
            className="flex-1 bg-transparent outline-none"
            style={{
              border: "none",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13.5px",
              color: "#e2e8f0",
              caretColor: "#22d3ee",
            }}
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            className="flex p-1"
            style={{
              background: "none",
              border: "none",
              color: "rgba(100,116,139,0.5)",
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.06,
              boxShadow: "0 0 16px rgba(34,211,238,0.4)",
            }}
            whileTap={{ scale: 0.93 }}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
            style={{
              border: "none",
              background:
                "linear-gradient(135deg, #0ea5e9, #22d3ee)",
              boxShadow:
                "0 0 12px rgba(34,211,238,0.25)",
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="white"
              strokeWidth="2.3"
              viewBox="0 0 24 24"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ChatArea);