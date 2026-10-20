import { useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { Link } from "react-router-dom";
import { easeOut } from "./shared";

const termsText = (
  <>
    By creating an account, you agree to our{" "}
    <Link
      to="/terms"
      className="font-medium text-black/60 underline underline-offset-2 hover:text-black dark:text-white/60 dark:hover:text-white"
    >
      Terms and Services
    </Link>{" "}
    and{" "}
    <Link
      to="/privacy"
      className="font-medium text-black/60 underline underline-offset-2 hover:text-black dark:text-white/60 dark:hover:text-white"
    >
      Privacy Policy
    </Link>
  </>
);

function FieldStack({ label, hint, value, onChange, type = "text", trailing }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        className={`block rounded-[10px] border bg-white px-4 pb-2 pt-2.5 transition-all dark:bg-white/[0.04] ${focused ? "border-[#fc7819]/70 shadow-[0_0_0_3px_rgba(252,120,25,0.15)]" : "border-black/15 dark:border-white/12 hover:border-black/30 dark:hover:border-white/25"}`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50 dark:text-white/45">{label}</span>
          {trailing}
        </span>
        <input
          type={type}
          value={value}
          aria-label={label}
          required
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="mt-1 w-full bg-transparent text-[17px] text-black outline-none placeholder:text-black/30 dark:text-white dark:placeholder:text-white/30"
          placeholder={label === "Name" ? "Ada Lovelace" : label === "Email" ? "you@studio.com" : "••••••••"}
        />
      </label>
      {hint && <p className="mt-1.5 pl-1 text-xs text-black/40 dark:text-white/35">{hint}</p>}
    </div>
  );
}

function CheckboxLine({ children, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 size-4 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer size-full appearance-none rounded-[4px] border border-black/25 bg-white transition-colors checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export function EmailAuthForm({
  state, name, setName, email, setEmail, password, setPassword,
  showPassword, setShowPassword, rememberMe, setRememberMe, agreed, setAgreed,
  submitting, onSubmit, reduceMotion,
}) {
  const isRegister = state === "register";

  const onMagnet = (e) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    e.currentTarget.style.transform = `translate(${x * 0.06}px, ${y * 0.12}px)`;
  };

  const resetMagnet = (e) => {
    e.currentTarget.style.transform = 'translate(0px, 0px)';
  };

  return (
    <>
      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-black/15 dark:bg-white/10" />
        <span className="inline-block rounded-full border border-black/15 bg-white px-3 py-1 text-[13px] font-medium text-black/55 dark:border-white/15 dark:bg-white/5 dark:text-white/55">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-black/15 dark:bg-white/10" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <Motion.form
          key={state}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="space-y-4"
          onSubmit={onSubmit}
        >
          {isRegister && (
            <FieldStack
              label="Name"
              hint="What should we call you?"
              value={name}
              onChange={setName}
              type="text"
            />
          )}

          <FieldStack
            label="Email"
            hint={isRegister ? "We'll only write when it matters." : "The one you signed up with."}
            value={email}
            onChange={setEmail}
            type="email"
          />
          <FieldStack
            label="Password"
            hint={isRegister ? "8+ characters — you know the drill." : "Forgot it? Just make a new account with the same email."}
            value={password}
            onChange={setPassword}
            type={showPassword ? "text" : "password"}
            trailing={
              <button
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="shrink-0 rounded-md px-1 text-black/50 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="space-y-3 pt-1 text-sm leading-5 text-black/60 dark:text-white/55">
            {isRegister && <CheckboxLine checked={agreed} onChange={setAgreed}>{termsText}</CheckboxLine>}
            {!isRegister && (
              <label className="flex cursor-pointer items-center gap-3">
                <span className="relative size-4 shrink-0">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer size-full appearance-none rounded-[4px] border border-black/25 bg-white transition-colors checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white"
                  />
                  <svg viewBox="0 0 12 12" className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black" fill="none" aria-hidden="true">
                    <path d="M3 6.2 5 8.1 9 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>Remember me on this machine</span>
              </label>
            )}
          </div>

          <Motion.button
            type="submit"
            disabled={submitting}
            whileHover={reduceMotion ? undefined : { scale: 1.015 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            onMouseMove={onMagnet}
            onMouseLeave={resetMagnet}
            className="group relative mt-4 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[10px] border border-black/40 bg-ink text-[17px] font-medium text-paper transition-all hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] disabled:opacity-60 dark:border-white/40 dark:bg-[#f5f1e8] dark:text-coal"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="size-2 animate-bounce rounded-full bg-current" />
                <span className="size-2 animate-bounce rounded-full bg-current [animation-delay:0.12s]" />
                <span className="size-2 animate-bounce rounded-full bg-current [animation-delay:0.24s]" />
                <span className="ml-1">Letting you in…</span>
              </span>
            ) : isRegister ? "Create account →" : "Log in →"}
          </Motion.button>
        </Motion.form>
      </AnimatePresence>
    </>
  );
}

export default EmailAuthForm;
