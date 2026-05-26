import { motion } from "framer-motion";

import ParticleCanvas from "../effects/ParticleCanvas";

const blobs = [
  {
    width: 600,
    height: 600,
    color: "#0369a1",
    top: "-200px",
    left: "-150px",
    duration: 10,
    delay: 0,
  },
  {
    width: 500,
    height: 500,
    color: "#0e7490",
    bottom: "-180px",
    right: "-120px",
    duration: 12,
    delay: 2,
  },
  {
    width: 350,
    height: 350,
    color: "#1d4ed8",
    top: "35%",
    left: "60%",
    duration: 14,
    delay: 4,
  },
];

export default function AuthBackground({ children }) {
  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 140% 100% at 50% -10%, #071428 0%, #050d1e 40%, #030810 100%)",
        }}
      />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {blobs.map((blob, index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.12, 0.22, 0.12],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: blob.delay,
            }}
            className="absolute rounded-full"
            style={{
              width: blob.width,
              height: blob.height,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: "blur(80px)",
              top: blob.top,
              bottom: blob.bottom,
              left: blob.left,
              right: blob.right,
            }}
          />
        ))}
      </div>

      <ParticleCanvas />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </>
  );
}
