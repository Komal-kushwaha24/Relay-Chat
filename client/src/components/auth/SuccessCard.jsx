import { motion } from "framer-motion";

export default function SuccessCard() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.88,
        y: 24,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full max-w-md"
    >
      <div
        style={{
          background: "rgba(7,18,40,0.8)",

          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",

          border:
            "1px solid rgba(34,211,238,0.15)",

          borderRadius: "24px",

          boxShadow:
            "0 0 60px rgba(34,211,238,0.12), 0 40px 100px rgba(0,0,0,0.6)",

          padding: "48px 32px",

          textAlign: "center",

          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",

            background:
              "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",
          }}
        />

        {/* Icon */}
        <motion.div
          initial={{
            scale: 0,
            rotate: -30,
          }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 280,
            damping: 18,
          }}
          style={{
            width: 68,
            height: 68,

            borderRadius: "20px",

            background:
              "linear-gradient(135deg, #0ea5e9, #22d3ee)",

            boxShadow:
              "0 0 40px rgba(34,211,238,0.55), 0 8px 24px rgba(0,0,0,0.5)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            margin: "0 auto 24px",
          }}
        >
          <svg
            width="30"
            height="30"
            fill="none"
            stroke="white"
            strokeWidth="2.8"
            viewBox="0 0 24 24"
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{
                pathLength: 0,
              }}
              animate={{
                pathLength: 1,
              }}
              transition={{
                delay: 0.45,
                duration: 0.5,
                ease: "easeOut",
              }}
            />
          </svg>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
          }}
          style={{
            fontFamily: "'Outfit', sans-serif",

            fontWeight: 800,

            fontSize: "28px",

            color: "#fff",

            letterSpacing: "-0.04em",

            marginBottom: "10px",
          }}
        >
          You're in! 🎉
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.45,
          }}
          style={{
            fontFamily: "'Inter', sans-serif",

            fontSize: "14px",

            color: "rgba(148,163,184,0.8)",

            lineHeight: 1.7,

            fontWeight: 300,
          }}
        >
          Welcome to{" "}
          <span
            style={{
              color: "#22d3ee",
              fontWeight: 500,
            }}
          >
            Relay Chat
          </span>
          .
          <br />
          Your account is ready. Start
          connecting.
        </motion.p>

        {/* Button */}
        <motion.button
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          whileHover={{
            scale: 1.03,

            boxShadow:
              "0 0 28px rgba(34,211,238,0.4)",
          }}
          whileTap={{
            scale: 0.97,
          }}
          style={{
            marginTop: "28px",

            padding: "13px 32px",

            borderRadius: "12px",

            border: "none",

            cursor: "pointer",

            background:
              "linear-gradient(135deg, #0ea5e9, #22d3ee)",

            color: "#fff",

            fontFamily: "'Outfit', sans-serif",

            fontWeight: 600,

            fontSize: "14px",

            boxShadow:
              "0 0 20px rgba(34,211,238,0.3)",
          }}
        >
          Go to Dashboard →
        </motion.button>
      </div>
    </motion.div>
  );
}