import { motion, AnimatePresence } from "framer-motion";

export default function ProfileToast({
  show,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -16,
            scale: 0.95,
          }}
          transition={{
            duration: 0.35,
          }}
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform:
              "translateX(-50%)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 20px",
            borderRadius: "14px",
            background:
              "rgba(7,18,40,0.92)",
            backdropFilter:
              "blur(20px)",
            border:
              "1px solid rgba(34,211,238,0.25)",
            boxShadow:
              "0 0 24px rgba(34,211,238,0.15)",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #0ea5e9, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
            }}
          >
            <svg
              width="11"
              height="11"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span
            style={{
              fontFamily:
                "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              color: "#e2e8f0",
            }}
          >
            Profile updated
            successfully
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}