import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import FloatInput from "./FloatInput";
import EyeButton from "./EyeButton";
import { resetPassword, validateResetToken } from "../../services/api";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("Missing reset token.");
        setChecking(false);
        return;
      }

      try {
        await validateResetToken(token);
        setValidToken(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Invalid or expired reset link. Please request a new one."
        );
      } finally {
        setChecking(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async () => {
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await resetPassword(token, { password });
      setStatus("Your password has been reset successfully. You may now log in.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
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

  if (checking) {
    return (
      <div style={{ minHeight: 220, display: 'grid', placeItems: 'center' }}>
        <span style={{ color: '#cbd5e1' }}>Validating reset link…</span>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div style={{ minHeight: 220 }}>
        <p style={{ color: '#f8b4b4', marginBottom: 18 }}>{error}</p>
        <Link
          to="/forgot-password"
          style={{ color: '#38bdf8', textDecoration: 'none' }}
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      {status && (
        <motion.div variants={stagger.item}>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-cyan-100">
            {status}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div variants={stagger.item}>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-100">
            {error}
          </div>
        </motion.div>
      )}

      <motion.div variants={stagger.item}>
        <FloatInput
          label="New Password"
          id="reset-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={null}
          right={
            <EyeButton
              show={showPassword}
              toggle={() => setShowPassword((prev) => !prev)}
            />
          }
        />
      </motion.div>

      <motion.div variants={stagger.item}>
        <FloatInput
          label="Confirm Password"
          id="reset-confirm"
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={null}
          right={
            <EyeButton
              show={showConfirm}
              toggle={() => setShowConfirm((prev) => !prev)}
            />
          }
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
                    '0 0 36px rgba(34,211,238,0.45), 0 8px 30px rgba(6,182,212,0.35)',
                }
              : {}
          }
          whileTap={!loading ? { scale: 0.97 } : {}}
          className="w-full cursor-pointer"
          style={{
            padding: '15px 24px',
            borderRadius: '14px',
            border: 'none',
            background: loading
              ? 'rgba(14,165,233,0.25)'
              : 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #22d3ee 100%)',
            boxShadow: loading
              ? 'none'
              : '0 0 24px rgba(34,211,238,0.3), 0 4px 20px rgba(0,0,0,0.4)',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          {loading ? 'Saving…' : 'Save new password'}
        </motion.button>
      </motion.div>

      <motion.p
        variants={stagger.item}
        style={{
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          color: 'rgba(148,163,184,0.9)',
          marginTop: 8,
        }}
      >
        Remembered your password?{' '}
        <Link
          to="/login"
          style={{
            color: '#38bdf8',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Login instead
        </Link>
      </motion.p>
    </motion.div>
  );
}
