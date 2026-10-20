import { cn } from "../lib/utils";

/**
 * Chaty wordmark set in Grandover (personal-use license, see
 * public/fonts/LICENSE-Grandover.txt).
 */
export function LogoWordmark({ className }) {
  return (
    <span className={cn("font-logo text-[22px] leading-none tracking-wide", className)}>
      Chaty
    </span>
  );
}

export function LogoTile({ className }) {
  return (
    <span
      className={cn(
        "font-logo flex size-10 items-center justify-center rounded-xl bg-ink text-[22px] text-paper dark:bg-[#fc7819] dark:text-black",
        className
      )}
      aria-hidden="true"
    >
      C
    </span>
  );
}

export default LogoWordmark;
