import { memo } from "react";
import { motion } from "framer-motion";

function EyeButtonComponent({ show, toggle }) {
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      className="p-1 rounded-lg cursor-pointer transition-colors duration-200"
      style={{
        color: show
          ? "rgba(34,211,238,0.85)"
          : "rgba(100,116,139,0.7)",

        background: "transparent",
        border: "none",
      }}
    >
      {show ? (
        <svg
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />

          <line
            x1="1"
            y1="1"
            x2="23"
            y2="23"
          />
        </svg>
      )}
    </motion.button>
  );
}

const EyeButton = memo(EyeButtonComponent);

export default EyeButton;