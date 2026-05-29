import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import FloatInput from "./FloatInput";
import SentBanner from "./SentBanner";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // TODO: replace with real reset link API call
      setTimeout(() => {
        setLoading(false);
        setSent(true);
      }, 1500);
    } catch (err) {
      setError("Unable to send reset link. Please try again later.");
      setLoading(false);
    }
  };

  const stagger = {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
      },
    },
    item: {
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      },
    },
  };

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      {sent && (
        <motion.div variants={stagger.item}>
          <SentBanner />
        </motion.div>
      )}

      <motion.div variants={stagger.item}>
        <FloatInput
          label="Email Address"
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
      </motion.div>

      <motion.div variants={stagger.item}>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          whileHover={
            !loading
              ? {
                  scale: 1.02,
                  boxShadow:
                    "0 0 36px rgba(34,211,238,0.45), 0 8px 30px rgba(6,182,212,0.35)",
                }
              : {}
          }
          whileTap={!loading ? { scale: 0.97 } : {}}
          className="w-full cursor-pointer"
          style={{
            padding: "15px 24px",
            borderRadius: "14px",
            border: "none",
            background: loading
              ? "rgba(14,165,233,0.25)"
              : "linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #22d3ee 100%)",
            boxShadow: loading
              ? "none"
              : "0 0 24px rgba(34,211,238,0.3), 0 4px 20px rgba(0,0,0,0.4)",
            color: "#fff",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: "15px",
          }}
        >
          {loading ? "Sending…" : "Send reset link"}
        </motion.button>
      </motion.div>

      <motion.p
        variants={stagger.item}
        style={{
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          color: "rgba(148,163,184,0.9)",
          marginTop: 8,
        }}
      >
        Remember your password? {" "}
        <Link
          to="/login"
          style={{
            color: "#38bdf8",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Go back to login
        </Link>
      </motion.p>
    </motion.div>
  );
}