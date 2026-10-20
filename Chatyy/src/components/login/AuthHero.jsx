import { motion as Motion } from "motion/react";
import { easeOut } from "./shared";

export function AuthHero({ isRegister, state, reduceMotion }) {
  return (
    <div className="mt-10">
      <Motion.h1
        key={state}
        initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="mt-3 text-[40px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-[54px]"
      >
        {isRegister ? (
          <>Create an <em className="font-serif italic tracking-[-0.03em]">account</em></>
        ) : (
          <>Welcome <em className="font-serif italic tracking-[-0.03em]">back</em><span className="text-[#fc7819]">.</span></>
        )}
      </Motion.h1>
      <Motion.svg
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ opacity: 1 }}
        viewBox="0 0 220 12"
        className="mt-2 h-3 w-44 text-[#fc7819]"
        fill="none"
        aria-hidden="true"
      >
        <Motion.path
          d="M3 8 C 40 3, 80 10, 115 6 S 190 4, 217 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: easeOut }}
        />
      </Motion.svg>
      <Motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
        className="mt-3 max-w-[46ch] text-[17px] leading-snug text-black/60 dark:text-white/55"
      >
        Chat in text, create in images.
        <span className="mt-1 block text-[13px] text-black/45 dark:text-white/40">
          1 credit per chat — 2 per image — counted honestly, right in the composer.
        </span>
      </Motion.p>
    </div>
  );
}

export default AuthHero;
