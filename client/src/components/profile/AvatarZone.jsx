import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getInitials(name) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

export default function AvatarZone({
  name,
  preview,
  onFile,
}) {
  const fileRef = useRef(null);

  const [hover, setHover] =
    useState(false);

  const [drag, setDrag] =
    useState(false);

  const initials = getInitials(
    name || "U"
  );

  const handleDrop = (e) => {
    e.preventDefault();

    setDrag(false);

    const file =
      e.dataTransfer.files?.[0];

    if (
      file &&
      file.type.startsWith("image/")
    ) {
      onFile(file);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          position: "relative",
          marginBottom: "14px",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(34,211,238,0.7), rgba(14,165,233,0.3), rgba(34,211,238,0.7))",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: "50%",
            background:
              "rgba(7,18,40,1)",
            zIndex: 1,
          }}
        />

        <motion.div
          onMouseEnter={() =>
            setHover(true)
          }
          onMouseLeave={() =>
            setHover(false)
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() =>
            setDrag(false)
          }
          onDrop={handleDrop}
          onClick={() =>
            fileRef.current.click()
          }
          whileHover={{
            scale: 1.04,
          }}
          whileTap={{
            scale: 0.97,
          }}
          style={{
            position: "relative",
            zIndex: 2,
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            cursor: "pointer",
            background: preview
              ? "transparent"
              : "linear-gradient(135deg, rgba(14,165,233,0.5), rgba(34,211,238,0.3))",
            border: drag
              ? "2px solid rgba(34,211,238,0.9)"
              : "2px solid rgba(34,211,238,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            transition:
              "border 0.2s",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: "32px",
                color:
                  "rgba(34,211,238,0.9)",
              }}
            >
              {initials}
            </span>
          )}

          <AnimatePresence>
            {(hover || drag) && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                style={{
                  position:
                    "absolute",
                  inset: 0,
                  borderRadius:
                    "50%",
                  background:
                    "rgba(7,18,40,0.72)",
                  display: "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "4px",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  stroke="rgba(34,211,238,0.9)"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle
                    cx="12"
                    cy="13"
                    r="4"
                  />
                </svg>

                <span
                  style={{
                    fontSize:
                      "9px",
                    color:
                      "rgba(34,211,238,0.8)",
                    letterSpacing:
                      "0.06em",
                    textTransform:
                      "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {drag
                    ? "Drop"
                    : "Change"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          onClick={() =>
            fileRef.current.click()
          }
          whileHover={{
            scale: 1.15,
          }}
          whileTap={{
            scale: 0.9,
          }}
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            zIndex: 3,
            width: 26,
            height: 26,
            borderRadius: "50%",
            cursor: "pointer",
            background:
              "linear-gradient(135deg, #0ea5e9, #22d3ee)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="white"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle
              cx="12"
              cy="13"
              r="4"
            />
          </svg>
        </motion.div>
      </div>

      <p
        style={{
          fontSize: "11px",
          color:
            "rgba(100,116,139,0.55)",
        }}
      >
        Tap avatar to upload
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{
          display: "none",
        }}
        onChange={(e) => {
          const file =
            e.target.files?.[0];

          if (file) {
            onFile(file);
          }

          e.target.value = "";
        }}
      />
    </div>
  );
}