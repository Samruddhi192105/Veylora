
"use client";

import { Clock3, Eye, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

type GameHUDProps = {
  timeLeft: number;
  discoveredCount: number;
  totalObjects: number;
  cluesCount: number;
};

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function GameHUD({
  timeLeft,
  discoveredCount,
  totalObjects,
  cluesCount,
}: GameHUDProps) {
  const danger = timeLeft <= 60;
  const warning = timeLeft <= 300;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <motion.div
        animate={danger ? { opacity: [1, 0.65, 1] } : {}}
        transition={{ duration: 1, repeat: danger ? Infinity : 0 }}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 backdrop-blur-xl sm:px-4 ${
          danger
            ? "border-red-400/30 bg-red-950/50 text-red-300"
            : warning
              ? "border-amber-300/25 bg-amber-950/40 text-amber-200"
              : "border-white/10 bg-black/40 text-white"
        }`}
      >
        <Clock3 size={17} />
        <span className="font-mono text-sm tabular-nums sm:text-base">
          {formatTime(timeLeft)}
        </span>
      </motion.div>

      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white/75 backdrop-blur-xl sm:px-4">
        <Eye size={16} />
        <span className="text-xs sm:text-sm">
          {discoveredCount}/{totalObjects}
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white/75 backdrop-blur-xl sm:px-4">
        <KeyRound size={16} />
        <span className="text-xs sm:text-sm">
          {cluesCount} clues
        </span>
      </div>
    </div>
  );
}
