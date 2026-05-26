import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 38;
const MAX_DISTANCE = 90;

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let running = true;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setCanvasSize();

    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.2 + 0.4,
    }));

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          const distSq = dx * dx + dy * dy;

          if (distSq < MAX_DISTANCE * MAX_DISTANCE) {
            const opacity =
              1 - distSq / (MAX_DISTANCE * MAX_DISTANCE);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.strokeStyle = `rgba(34,211,238,${
              opacity * 0.08
            })`;

            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x <= 0 || p.x >= width) p.dx *= -1;
        if (p.y <= 0 || p.y >= height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(103,232,249,0.6)";
        ctx.fill();
      }

      animationRef.current =
        requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      setCanvasSize();
    };

    const handleVisibility = () => {
      running = !document.hidden;

      if (running) {
        draw();
      } else {
        cancelAnimationFrame(animationRef.current);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      running = false;

      cancelAnimationFrame(
        animationRef.current
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
    />
  );
}