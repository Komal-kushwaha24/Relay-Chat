import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function FloatInputComponent({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  right,
}) {
  const [focused, setFocused] = useState(false);

  const lifted = focused || value.length > 0;

  const containerStyle = useMemo(
    () => ({
      background: focused
        ? "rgba(14,165,233,0.07)"
        : "rgba(255,255,255,0.04)",

      border: error
        ? "1px solid rgba(248,113,113,0.6)"
        : focused
        ? "1px solid rgba(34,211,238,0.55)"
        : "1px solid rgba(255,255,255,0.08)",

      boxShadow: focused
        ? "0 0 0 3px rgba(34,211,238,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
        : "inset 0 1px 0 rgba(255,255,255,0.04)",
    }),
    [focused, error]
  );

  const labelStyle = useMemo(
    () => ({
      fontFamily: "'Inter', sans-serif",
      fontSize: lifted ? "10px" : "14px",
      top: lifted ? "8px" : "50%",
      transform: lifted
        ? "none"
        : "translateY(-50%)",

      color: error
        ? "rgba(248,113,113,0.8)"
        : focused
        ? "rgba(34,211,238,0.9)"
        : "rgba(148,163,184,0.7)",

      letterSpacing: lifted ? "0.08em" : "0",
      textTransform: lifted
        ? "uppercase"
        : "none",

      fontWeight: lifted ? 600 : 400,
    }),
    [lifted, focused, error]
  );

  return (
    <div className="relative">
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={containerStyle}
      >
        <label
          htmlFor={id}
          className="absolute left-4 transition-all duration-200 pointer-events-none select-none"
          style={labelStyle}
        >
          {label}
        </label>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          className="w-full bg-transparent outline-none text-white pr-11"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            padding: "22px 16px 10px",
            caretColor: "#22d3ee",
          }}
        />

        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {right}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="flex items-center gap-1.5 px-1 mt-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <circle
                cx="6"
                cy="6"
                r="5.5"
                stroke="rgba(248,113,113,0.8)"
              />

              <path
                d="M6 3.5v3M6 8v.5"
                stroke="rgba(248,113,113,0.8)"
                strokeLinecap="round"
              />
            </svg>

            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "rgba(248,113,113,0.85)",
              }}
            >
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FloatInput = memo(FloatInputComponent);

export default FloatInput;