import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px",
        borderRadius: "12px",
        background: focused
          ? "rgba(14,165,233,0.06)"
          : "rgba(255,255,255,0.04)",
        border: focused
          ? "1px solid rgba(34,211,238,0.4)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: focused
          ? "0 0 0 3px rgba(34,211,238,0.08)"
          : "none",
        transition: "all 0.2s",
      }}
    >
      <svg
        width="14"
        height="14"
        fill="none"
        stroke={
          focused
            ? "rgba(34,211,238,0.7)"
            : "rgba(100,116,139,0.6)"
        }
        strokeWidth="2"
        viewBox="0 0 24 24"
        style={{
          flexShrink: 0,
          transition: "stroke 0.2s",
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <path
          d="m21 21-4.35-4.35"
          strokeLinecap="round"
        />
      </svg>

      <input
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search conversations…"
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#e2e8f0",
          width: "100%",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          padding: "10px 0",
          caretColor: "#22d3ee",
        }}
      />

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() =>
              onChange({
                target: { value: "" },
              })
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "rgba(100,116,139,0.6)",
              display: "flex",
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(SearchBar);