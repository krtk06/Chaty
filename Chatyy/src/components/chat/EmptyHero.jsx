import { motion as Motion } from "motion/react";
import { ArrowUpRight, ImagePlus, Type } from "lucide-react";

const dotMask = "radial-gradient(ellipse 78% 68% at 50% 42%, black, transparent)";

/**
 * Full-bleed welcome backdrop: a warm canvas with an orange bloom and a
 * faint dot grid, spanning the whole thread container. Light theme stays
 * light (cream); dark theme keeps the black stage.
 */
function RayBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div className="absolute inset-0 bg-cream dark:bg-coal" />

      {/* orange bloom - light */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 62% 72% at 50% 64%, rgba(252,120,25,0.18) 0%, rgba(252,120,25,0.08) 38%, rgba(252,120,25,0.02) 62%, transparent 78%)",
        }}
      />
      {/* orange bloom - dark */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 62% 72% at 50% 64%, rgba(252,120,25,0.42) 0%, rgba(252,120,25,0.16) 38%, rgba(252,120,25,0.05) 62%, transparent 78%)",
        }}
      />

      {/* dot grid - light */}
      <div
        className="absolute inset-0 opacity-70 dark:hidden"
        style={{
          backgroundImage: "radial-gradient(rgba(28,25,23,0.10) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: dotMask,
          WebkitMaskImage: dotMask,
        }}
      />
      {/* dot grid - dark */}
      <div
        className="absolute inset-0 hidden opacity-[0.28] dark:block"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: dotMask,
          WebkitMaskImage: dotMask,
        }}
      />
    </div>
  );
}

export default function EmptyHero({ starters, onPick, reduceMotion }) {
  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-14">
      <RayBackdrop />

      <div className="relative z-10 my-auto flex w-full max-w-2xl flex-col items-center">
        <Motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-black/45 uppercase dark:text-white/50">
            New session
          </p>
          <h3 className="mx-auto mt-3 max-w-[16ch] text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-ink dark:text-white sm:text-4xl">
            What will you{" "}
            <em className="font-editorial bg-gradient-to-b from-[#e8630a] to-[#fc7819] bg-clip-text italic text-transparent dark:from-[#fc7819] dark:to-[#ffd9ad]">
              imagine
            </em>{" "}
            today?
          </h3>
          <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-relaxed text-black/55 dark:text-white/55">
            Chat in text, create in images — pick a spark below or just start typing.
          </p>
        </Motion.div>

        <div className="mx-auto mt-10 grid w-full gap-2.5 text-left sm:grid-cols-2">
          {starters.map((prompt, i) => {
            const isImage = prompt.toLowerCase().includes("image");
            return (
              <Motion.button
                key={prompt}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={() => onPick(prompt)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-white/70 p-3.5 text-left backdrop-blur-sm transition-colors hover:border-[#fc7819]/60 hover:bg-white dark:border-white/12 dark:bg-white/[0.05] dark:hover:border-[#fc7819]/60 dark:hover:bg-white/[0.09]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fc7819]/15 text-[#c85a0c] transition-colors group-hover:bg-[#fc7819] group-hover:text-white dark:text-[#fc7819] dark:group-hover:text-black">
                  {isImage ? <ImagePlus className="size-4" /> : <Type className="size-4" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-black/70 transition-colors group-hover:text-black dark:text-white/80 dark:group-hover:text-white">
                  {prompt}
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-black/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#fc7819] dark:text-white/30" />
              </Motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
