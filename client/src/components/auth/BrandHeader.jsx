import { motion } from "framer-motion";

export default function BrandHeader() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <motion.div
        whileHover={{
          rotate: [0, -10, 10, 0],
          scale: 1.1,
        }}
        transition={{ duration: 0.4 }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
          boxShadow:
            "0 0 20px rgba(34,211,238,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        💬
      </motion.div>

      <div>
        <span
          style={{
            fontWeight: 800,
            fontSize: "22px",
            color: "#fff",
          }}
        >
          Relay<span style={{ color: "#22d3ee" }}>Chat</span>
        </span>

        <div
          style={{
            fontSize: "10px",
            color: "rgba(34,211,238,0.6)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Real-time messaging
        </div>
      </div>
    </div>
  );
}