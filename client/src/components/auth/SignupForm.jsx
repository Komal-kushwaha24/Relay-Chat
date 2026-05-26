import { useState } from "react";
import { Link } from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import FloatInput from "./FloatInput";
import EyeButton from "./EyeButton";
import PasswordStrength from "./PasswordStrength";

import TiltCard from "../effects/TiltCard";

export default function SignupForm({
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    pw: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] =
    useState(false);

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const toggle = (key) => () => {
    setShow((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name =
        "Full name is required";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (form.password.length < 8) {
      newErrors.password =
        "At least 8 characters required";
    }

    if (
      form.confirm !== form.password
    ) {
      newErrors.confirm =
        "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors =
      validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors)
        .length
    )
      return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (onSuccess) {
        onSuccess();
      }
    }, 1800);
  };

  const stagger = {
    container: {
      hidden: {},

      visible: {
        transition: {
          staggerChildren: 0.07,
          delayChildren: 0.25,
        },
      },
    },

    item: {
      hidden: {
        opacity: 0,
        y: 16,
      },

      visible: {
        opacity: 1,
        y: 0,

        transition: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
  };

  return (
    <TiltCard>
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -30,
          scale: 0.97,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Card */}
        <div
          style={{
            background:
              "rgba(7,18,40,0.75)",

            backdropFilter: "blur(28px)",

            WebkitBackdropFilter:
              "blur(28px)",

            border:
              "1px solid rgba(34,211,238,0.1)",

            borderRadius: "24px",

            boxShadow:
              "0 0 0 1px rgba(34,211,238,0.05), 0 4px 32px rgba(3,105,161,0.15), 0 40px 100px rgba(0,0,0,0.6)",

            padding: "36px 32px 32px",

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
                "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.6) 40%, rgba(14,165,233,0.6) 60%, transparent 100%)",
            }}
          />

          {/* Corner Glow */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",

              width: "200px",
              height: "200px",

              borderRadius: "50%",

              background:
                "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",

              pointerEvents: "none",
            }}
          />

          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="visible"
          >
            {/* Brand */}
            <motion.div
              variants={stagger.item}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div
                whileHover={{
                  rotate: [
                    0,
                    -10,
                    10,
                    0,
                  ],

                  scale: 1.1,
                }}
                transition={{
                  duration: 0.4,
                }}
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
                  justifyContent:
                    "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    fill="white"
                  />
                </svg>
              </motion.div>

              <div>
                <span
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",

                    fontWeight: 800,

                    fontSize: "22px",

                    color: "#fff",

                    letterSpacing:
                      "-0.03em",

                    lineHeight: 1,
                  }}
                >
                  Relay
                  <span
                    style={{
                      color: "#22d3ee",
                    }}
                  >
                    Chat
                  </span>
                </span>

                <div
                  style={{
                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "10px",

                    color:
                      "rgba(34,211,238,0.6)",

                    letterSpacing:
                      "0.18em",

                    textTransform:
                      "uppercase",

                    fontWeight: 500,

                    marginTop: "2px",
                  }}
                >
                  Real-time messaging
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              variants={stagger.item}
              style={{
                marginBottom: "28px",
              }}
            >
              <h1
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",

                  fontWeight: 700,

                  fontSize: "28px",

                  color: "#fff",

                  letterSpacing:
                    "-0.04em",

                  lineHeight: 1.2,

                  marginBottom: "8px",
                }}
              >
                Create your account
              </h1>

              <p
                style={{
                  fontFamily:
                    "'Inter', sans-serif",

                  fontSize: "14px",

                  color:
                    "rgba(148,163,184,0.8)",

                  lineHeight: 1.6,

                  fontWeight: 300,
                }}
              >
                Join thousands of teams
                communicating in real
                time.
              </p>
            </motion.div>

            {/* Inputs */}
            <motion.div
              variants={stagger.item}
            >
              <FloatInput
                label="Full Name"
                id="name"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
              />
            </motion.div>

            <motion.div
              variants={stagger.item}
              style={{ marginTop: 14 }}
            >
              <FloatInput
                label="Email Address"
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />
            </motion.div>

            <motion.div
              variants={stagger.item}
              style={{ marginTop: 14 }}
            >
              <FloatInput
                label="Password"
                id="password"
                type={
                  show.pw
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={set(
                  "password"
                )}
                error={
                  errors.password
                }
                right={
                  <EyeButton
                    show={show.pw}
                    toggle={toggle(
                      "pw"
                    )}
                  />
                }
              />

              <PasswordStrength
                password={
                  form.password
                }
              />
            </motion.div>

            <motion.div
              variants={stagger.item}
              style={{ marginTop: 14 }}
            >
              <FloatInput
                label="Confirm Password"
                id="confirm"
                type={
                  show.confirm
                    ? "text"
                    : "password"
                }
                value={form.confirm}
                onChange={set(
                  "confirm"
                )}
                error={
                  errors.confirm
                }
                right={
                  <EyeButton
                    show={
                      show.confirm
                    }
                    toggle={toggle(
                      "confirm"
                    )}
                  />
                }
              />
            </motion.div>

            {/* Button */}
            <motion.div
              variants={stagger.item}
              style={{ marginTop: 28 }}
            >
              <motion.button
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
                whileTap={
                  !loading
                    ? {
                        scale: 0.97,
                      }
                    : {}
                }
                className="w-full cursor-pointer"
                style={{
                  padding:
                    "15px 24px",

                  borderRadius:
                    "14px",

                  border: "none",

                  background:
                    loading
                      ? "rgba(14,165,233,0.25)"
                      : "linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #22d3ee 100%)",

                  boxShadow:
                    loading
                      ? "none"
                      : "0 0 24px rgba(34,211,238,0.3), 0 4px 20px rgba(0,0,0,0.4)",

                  color: "#fff",

                  fontFamily:
                    "'Outfit', sans-serif",

                  fontWeight: 600,

                  fontSize: "15px",

                  letterSpacing:
                    "-0.01em",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  gap: "8px",

                  position: "relative",

                  overflow: "hidden",
                }}
              >
                {!loading && (
                  <motion.div
                    initial={{
                      x: "-100%",
                      skewX: -20,
                    }}
                    whileHover={{
                      x: "250%",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                    }}
                    style={{
                      position:
                        "absolute",

                      top: 0,
                      bottom: 0,

                      width: "60px",

                      background:
                        "rgba(255,255,255,0.18)",

                      pointerEvents:
                        "none",
                    }}
                  />
                )}

                {loading ? (
                  <>
                    <motion.span
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 0.85,
                        repeat:
                          Infinity,

                        ease: "linear",
                      }}
                      style={{
                        display:
                          "inline-block",

                        width: "16px",

                        height:
                          "16px",

                        border:
                          "2px solid rgba(255,255,255,0.25)",

                        borderTopColor:
                          "#fff",

                        borderRadius:
                          "50%",
                      }}
                    />

                    Creating account…
                  </>
                ) : (
                  <>
                    Get started 
                  
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={stagger.item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",

                  background:
                    "rgba(255,255,255,0.07)",
                }}
              />

              <span
                style={{
                  fontFamily:
                    "'Inter', sans-serif",

                  fontSize: "11px",

                  color:
                    "rgba(100,116,139,0.6)",

                  letterSpacing:
                    "0.1em",

                  textTransform:
                    "uppercase",
                }}
              >
                or
              </span>

              <div
                style={{
                  flex: 1,
                  height: "1px",

                  background:
                    "rgba(255,255,255,0.07)",
                }}
              />
            </motion.div>

            {/* Footer */}
            <motion.p
              variants={stagger.item}
              style={{
                textAlign: "center",

                fontFamily:
                  "'Inter', sans-serif",

                fontSize: "13px",

                color:
                  "rgba(100,116,139,0.8)",
              }}
            >
              Already have an account?{" "}

              <Link
                to="/login"
                style={{
                  color: "#38bdf8",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Sign in →
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* Terms */}
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.1,
          }}
          style={{
            textAlign: "center",

            fontFamily:
              "'Inter', sans-serif",

            fontSize: "11px",

            color:
              "rgba(100,116,139,0.5)",

            marginTop: "16px",
          }}
        >
          By signing up you agree to our{" "}

          <a
            href="#"
            style={{
              color:
                "rgba(100,116,139,0.7)",

              textDecoration:
                "underline",

              textUnderlineOffset:
                "3px",
            }}
          >
            Terms
          </a>

          {" & "}

          <a
            href="#"
            style={{
              color:
                "rgba(100,116,139,0.7)",

              textDecoration:
                "underline",

              textUnderlineOffset:
                "3px",
            }}
          >
            Privacy Policy
          </a>
          .
        </motion.p>
      </motion.div>
    </TiltCard>
  );
}