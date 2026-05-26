import { memo, useMemo } from "react";
import { motion } from "framer-motion";

function PasswordStrengthComponent({
  password,
}) {
  const { score, label, color } = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "",
        color: "",
      };
    }

    let calculatedScore = 1;

    if (password.length >= 6) {
      calculatedScore = 2;
    }

    if (password.length >= 10) {
      calculatedScore = 3;
    }

    const hasUppercase =
      /[A-Z]/.test(password);

    const hasNumber =
      /[0-9]/.test(password);

    const hasSpecial =
      /[^a-zA-Z0-9]/.test(password);

    if (
      password.length >= 10 &&
      hasUppercase &&
      hasNumber &&
      hasSpecial
    ) {
      calculatedScore = 4;
    }

    const labels = [
      "",
      "Weak",
      "Fair",
      "Good",
      "Strong",
    ];

    const colors = [
      "",
      "#ef4444",
      "#f59e0b",
      "#3b82f6",
      "#22d3ee",
    ];

    return {
      score: calculatedScore,
      label: labels[calculatedScore],
      color: colors[calculatedScore],
    };
  }, [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -4,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="px-1 mt-2"
    >
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((item) => (
          <motion.div
            key={item}
            className="flex-1 h-0.5 rounded-full"
            animate={{
              backgroundColor:
                item <= score
                  ? color
                  : "rgba(255,255,255,0.1)",
            }}
            transition={{
              duration: 0.25,
            }}
          />
        ))}
      </div>

      <span
        style={{
          fontSize: "10px",
          fontFamily: "'Inter', sans-serif",
          color,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

const PasswordStrength = memo(
  PasswordStrengthComponent
);

export default PasswordStrength;