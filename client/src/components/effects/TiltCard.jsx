import { motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback } from "react";

export default function TiltCard({ children }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(
    mouseY,
    [-0.5, 0.5],
    [4, -4]
  );

  const rotateY = useTransform(
    mouseX,
    [-0.5, 0.5],
    [-4, 4]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const rect =
        e.currentTarget.getBoundingClientRect();

      const x =
        (e.clientX - rect.left) / rect.width - 0.5;

      const y =
        (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}