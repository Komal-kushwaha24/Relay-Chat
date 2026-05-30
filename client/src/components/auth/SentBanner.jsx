import { motion } from "framer-motion";

export default function SentBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400">
        ✉️
      </div>

      <div>
        <p className="font-semibold text-cyan-100">
          Reset link sent!
        </p>

        <p className="text-sm text-slate-400">
          Check inbox and spam folder.
        </p>
      </div>
    </motion.div>
  );
}