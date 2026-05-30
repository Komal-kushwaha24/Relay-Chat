import { memo, useCallback } from "react";
import { motion } from "framer-motion";

import Avatar from "../common/Avatar";

function ChatRow({
  chat,
  active,
  onClick,
}) {
  const handleClick = useCallback(() => {
    onClick(chat.id);
  }, [chat.id, onClick]);

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "14px",
        cursor: "pointer",

        background: active
          ? "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(34,211,238,0.08))"
          : "transparent",

        border: active
          ? "1px solid rgba(34,211,238,0.15)"
          : "1px solid transparent",

        boxShadow: active
          ? "0 0 16px rgba(34,211,238,0.06)"
          : "none",

        transition:
          "background 0.2s, border 0.2s",
      }}
    >
      <Avatar
        src={chat.avatarSrc}
        initials={chat.avatar}
        color={chat.color}
        size={40}
        online={chat.online}
        group={chat.group}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "3px",
          }}
        >
          <span
            style={{
              fontFamily:
                "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: "13.5px",
              color: active
                ? "#e0f7ff"
                : "#cbd5e1",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {chat.name}
          </span>

          <span
            style={{
              fontFamily:
                "'Inter', sans-serif",
              fontSize: "10px",
              color: chat.unread
                ? "rgba(34,211,238,0.7)"
                : "rgba(100,116,139,0.55)",

              flexShrink: 0,
              marginLeft: "6px",
            }}
          >
            {chat.time}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily:
                "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 300,
              color: chat.typing
                ? "rgba(34,211,238,0.9)"
                : "rgba(100,116,139,0.7)",

              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {chat.typing ? (chat.typingNames && chat.typingNames.length > 0 ? `${chat.typingNames[0].name} is typing...` : 'Typing...') : chat.msg}
          </span>

          {chat.unread > 0 && (
            <div
              style={{
                minWidth: "18px",
                height: "18px",
                borderRadius: "9px",
                flexShrink: 0,
                marginLeft: "6px",

                background:
                  "linear-gradient(135deg, #0ea5e9, #22d3ee)",

                boxShadow:
                  "0 0 8px rgba(34,211,238,0.5)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                fontFamily:
                  "'Outfit', sans-serif",

                fontWeight: 700,
                fontSize: "10px",
                color: "#fff",
              }}
            >
              {chat.unread}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ChatRow);