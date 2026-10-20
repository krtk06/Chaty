import { useRef } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { easeOut } from "./shared";

const rotatingWords = ["faster", "wilder", "brighter", "stranger"];

function SparkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.6 4.8 2.6 7.2 8 8-5.4.8-7.4 3.2-8 8-.6-4.8-2.6-7.2-8-8 5.4-.8 7.4-3.2 8-8Z" />
      <path d="M19 2c.3 2.1 1.1 3.1 3.5 3.5-2.4.4-3.2 1.4-3.5 3.5-.3-2.1-1.1-3.1-3.5-3.5 2.4-.4 3.2-1.4 3.5-3.5Z" />
    </svg>
  );
}

export function DarkroomPanel({ wordIndex, reduceMotion, onStart }) {
  const panelRef = useRef(null);

  const onTilt = (e) => {
    if (reduceMotion || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    panelRef.current.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  };

  const resetTilt = () => {
    if (panelRef.current) panelRef.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  };

  return (
    <div
      className="relative hidden overflow-hidden rounded-md bg-black text-white lg:block"
      onMouseMove={onTilt}
      onMouseLeave={resetTilt}
    >
      <div ref={panelRef} className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform">
        <GrainGradient
          speed={1}
          scale={1}
          rotation={0}
          offsetX={0}
          offsetY={0}
          softness={0.5}
          intensity={0.5}
          noise={0.25}
          shape="corners"
          frame={2854.5}
          colors={["#FFFFFF", "#FC7819", "#FC7819", "#FFFFFF"]}
          colorBack="#00000000"
          className="absolute inset-0 bg-black"
        />
      </div>

      <div className="relative z-20 flex h-full min-h-[760px] w-full flex-col justify-between p-10 xl:p-14">
        <Motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
        >
          <h2 className="mt-4 max-w-[12ch] text-6xl font-medium leading-[0.98] tracking-[-0.05em] xl:text-[72px]">
            Think fast,
            <br />
            Imagine{" "}
            <span className="relative inline-block min-w-[5ch]">
              <AnimatePresence mode="wait" initial={false}>
                <Motion.span
                  key={wordIndex}
                  initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduceMotion ? {} : { opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.4, ease: easeOut }}
                  className="inline-block font-serif italic text-[#fc7819]"
                >
                  {rotatingWords[wordIndex]}
                </Motion.span>
              </AnimatePresence>
            </span>
          </h2>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-white/60">
            One composer, two mediums. Yesterday's chats pinned left, today's
            images drying on the line below.
          </p>
        </Motion.div>

        <Motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
        >
          <Motion.button
            onClick={onStart}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="group inline-flex h-[52px] max-w-full cursor-pointer items-center gap-3 rounded-[10px] border border-white/25 bg-white/5 px-6 text-[17px] font-medium text-white/90 backdrop-blur-sm transition-all hover:border-[#fc7819]/70 hover:bg-white/10 hover:text-white"
          >
            <SparkIcon className="size-5 shrink-0 transition-transform duration-500 group-hover:rotate-[25deg]" />
            <span className="truncate whitespace-nowrap">
              Start creating with Chaty
            </span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Motion.button>
          {/* marquee */}
          <div className="relative mt-8 overflow-hidden border-t border-white/15 pt-4" aria-hidden="true">
            <Motion.div
              animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
              transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: "linear" }}
              className="flex w-max gap-8 whitespace-nowrap text-[13px] uppercase tracking-[0.18em] text-white/45"
            >
              {Array.from({ length: 2 }).map((_, k) => (
                <span key={k} className="flex gap-8">
                  <span>text → image → community →</span>
                  <span>1 credit chats — 2 credit dreams →</span>
                  <span>text → image → community →</span>
                  <span>1 credit chats — 2 credit dreams →</span>
                </span>
              ))}
            </Motion.div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}

export default DarkroomPanel;
