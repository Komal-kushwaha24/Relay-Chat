import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import FloatInput from "./FloatInput";
import EyeButton from "./EyeButton";
import TiltCard from "../effects/TiltCard";
import { loginUser } from "../../services/api";

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    setLoading(true);

    try {
      const { data } = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      const token = data.token ?? data.data?.id;

      if (token) {
        localStorage.setItem("token", token);
      }

      navigate("/home");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const stagger = {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.07, delayChildren: 0.25 },
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
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          style={{
            background: "rgba(7,18,40,0.75)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(34,211,238,0.1)",
            borderRadius: "24px",
            boxShadow:
              "0 0 0 1px rgba(34,211,238,0.05), 0 4px 32px rgba(3,105,161,0.15), 0 40px 100px rgba(0,0,0,0.6)",
            padding: "36px 32px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.6) 40%, rgba(14,165,233,0.6) 60%, transparent 100%)",
            }}
          />

          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={stagger.item}
              className="flex items-center gap-3 mb-8"
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
                  boxShadow:
                    "0 0 20px rgba(34,211,238,0.4), 0 4px 12px rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: "22px",
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  Relay<span style={{ color: "#22d3ee" }}>Chat</span>
                </span>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    color: "rgba(34,211,238,0.6)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    marginTop: "2px",
                  }}
                >
                  Real-time messaging
                </div>
              </div>
            </motion.div>

            <motion.div variants={stagger.item} style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: "28px",
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.2,
                  marginBottom: "8px",
                }}
              >
                Welcome back
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "rgba(148,163,184,0.8)",
                  lineHeight: 1.6,
                  fontWeight: 300,
                }}
              >
                Sign in to continue to your conversations.
              </p>
            </motion.div>

            <motion.div variants={stagger.item}>
              <FloatInput
                label="Email Address"
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={stagger.item} style={{ marginTop: 14 }}>
              <FloatInput
                label="Password"
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                right={
                  <EyeButton
                    show={showPassword}
                    toggle={() => setShowPassword((v) => !v)}
                  />
                }
              />
            </motion.div>

            <motion.div variants={stagger.item} style={{ marginTop: 28 }}>
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
                {loading ? "Signing in…" : "Sign in"}
              </motion.button>
            </motion.div>

            <motion.p
              variants={stagger.item}
              style={{
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "rgba(100,116,139,0.8)",
                marginTop: 20,
              }}
            >
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#38bdf8",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Create account →
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </TiltCard>
  );
}
