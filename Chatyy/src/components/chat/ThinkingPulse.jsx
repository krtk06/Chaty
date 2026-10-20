import { motion as Motion } from "motion/react";

// Thinking indicator: orbiting pulse around the brand spark.
export default function ThinkingPulse({ reduceMotion }) {
  if (reduceMotion) {
    return (
      <output className="my-4 flex items-center gap-2 text-sm text-black/50 dark:text-white/50" aria-label="Generating response">
        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <span className="block h-full w-2/5 rounded-full bg-[#fc7819] animate-shimmer" />
        </span>
        Thinking…
      </output>
    );
  }
  return (
    <output className="my-5 flex items-center gap-3" aria-label="Generating response">
      <span className="relative flex size-8 items-center justify-center">
        <Motion.span
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-xl bg-[#fc7819]/50"
        />
        <Motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-xl border border-dashed border-[#fc7819]/70"
        />
        <span className="relative flex size-8 items-center justify-center rounded-xl bg-[#fc7819] text-sm font-bold text-black">
          ✦
        </span>
      </span>
      <Motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="text-sm text-black/55 dark:text-white/55"
      >
        Thinking…
      </Motion.span>
    </output>
  );
}
