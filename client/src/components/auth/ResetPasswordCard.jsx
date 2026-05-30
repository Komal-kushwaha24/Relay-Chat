import { motion } from "framer-motion";

import TiltCard from "../effects/TiltCard";
import BrandHeader from "./BrandHeader";
import ResetHeader from "./ResetHeader";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordCard() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <TiltCard>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            style={{
              background: "rgba(7,18,40,0.75)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(34,211,238,0.1)",
              borderRadius: "24px",
              boxShadow:
                "0 0 0 1px rgba(34,211,238,0.05), 0 4px 32px rgba(3,105,161,0.15), 0 40px 100px rgba(0,0,0,0.6)",
              padding: "36px 32px 32px",
              position: "relative",
              overflow: "hidden",
              width: "420px",
              maxWidth: "100%",
            }}
          >
            <BrandHeader />

            <ResetHeader
              title="Set a new password"
              description="Enter a strong password below and save it to finish resetting your account."
            />

            <ResetPasswordForm />
          </div>
        </motion.div>
      </TiltCard>
    </div>
  );
}
