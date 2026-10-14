"use client";

import { motion } from "framer-motion";

export default function AmbientRoom() {
  const dustParticles = [
  { x: 8, y: 20, duration: 17, delay: 0 },
  { x: 16, y: 65, duration: 21, delay: 2 },
  { x: 24, y: 40, duration: 15, delay: 4 },
  { x: 31, y: 78, duration: 24, delay: 1 },
  { x: 39, y: 30, duration: 18, delay: 5 },
  { x: 46, y: 60, duration: 22, delay: 3 },
  { x: 53, y: 18, duration: 19, delay: 6 },
  { x: 61, y: 72, duration: 25, delay: 2 },
  { x: 68, y: 42, duration: 16, delay: 4 },
  { x: 74, y: 25, duration: 20, delay: 1 },
  { x: 81, y: 68, duration: 23, delay: 5 },
  { x: 88, y: 35, duration: 17, delay: 3 },
  { x: 94, y: 80, duration: 26, delay: 7 },
  { x: 12, y: 90, duration: 19, delay: 6 },
  { x: 28, y: 12, duration: 23, delay: 2 },
  { x: 57, y: 88, duration: 18, delay: 4 },
  { x: 71, y: 55, duration: 21, delay: 1 },
  { x: 90, y: 15, duration: 24, delay: 5 },
];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Main darkness */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Warm central light */}
      <motion.div
        animate={{
          opacity: [0.035, 0.055, 0.04, 0.06, 0.035],
          scale: [1, 1.03, 0.99, 1.02, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          left-1/2
          top-[15%]
          h-[55vh]
          w-[55vw]
          -translate-x-1/2
          rounded-full
          bg-[#d8c5a4]
          blur-[130px]
        "
      />

      {/* Left shadow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.4, 0.32, 0.45, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -left-[15%]
          top-[20%]
          h-[60vh]
          w-[40vw]
          rounded-full
          bg-black
          blur-[100px]
        "
      />

      {/* Right shadow */}
      <motion.div
        animate={{
          opacity: [0.25, 0.35, 0.28, 0.4, 0.25],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -right-[15%]
          top-[15%]
          h-[65vh]
          w-[40vw]
          rounded-full
          bg-black
          blur-[110px]
        "
      />

      {/* Dust particles */}
      {dustParticles.map((particle) => (
  <motion.span
    key={`${particle.x}-${particle.y}`}
    initial={{
      opacity: 0,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
    }}
    animate={{
      opacity: [0, 0.15, 0.05, 0.18, 0],
      y: [0, -40, -80],
      x: [0, 8, -5],
    }}
    transition={{
      duration: particle.duration,
      repeat: Infinity,
      ease: "linear",
      delay: particle.delay,
    }}
    className="
      absolute
      h-[2px]
      w-[2px]
      rounded-full
      bg-white
    "
  />
))}

      {/* Film grain */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.025]
          bg-[repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            white 4px
          )]
        "
      />

      {/* Cinematic vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(
            ellipse_at_center,
            transparent 25%,
            rgba(0,0,0,0.75) 100%
          )]
        "
      />
    </div>
  );
}