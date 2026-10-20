import { useEffect, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { useAppContext } from '../context/AppContext';
import { useSocialAuth } from '../lib/useSocialAuth';
import { LogoWordmark } from '../components/Logo';
import AuthHero from '../components/login/AuthHero';
import SocialAuthButtons from '../components/login/SocialAuthButtons';
import EmailAuthForm from '../components/login/EmailAuthForm';
import DarkroomPanel from '../components/login/DarkroomPanel';
import { easeOut } from '../components/login/shared';
import toast from 'react-hot-toast';

const rotatingWordsCount = 4;

function AuthPanel({ reduceMotion, children }) {
  return (
    <Motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeOut }}
      className="relative min-w-0 overflow-hidden rounded-md border border-black/20 bg-paper dark:border-white/10 dark:bg-ember"
    >
      {/* paper grain: the human touch */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply dark:mix-blend-overlay">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#paperNoise)" opacity="0.06" />
        </svg>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-10 hidden w-px bg-[#fc7819]/20 sm:block" />

      <div className="relative flex min-h-[760px] items-start px-6 py-8 sm:px-10 lg:min-h-0 lg:px-14 lg:py-10 xl:px-16">
        <div className="mx-auto w-full min-w-0 max-w-[560px]">{children}</div>
      </div>
    </Motion.div>
  )
}

function Login() {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const { axios, setToken } = useAppContext()
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const appleConfigured = Boolean(import.meta.env.VITE_APPLE_CLIENT_ID);
  const isRegister = state === "register";

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setWordIndex((i) => (i + 1) % rotatingWordsCount), 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const persistToken = (nextToken) => {
    if (rememberMe) {
      localStorage.setItem('token', nextToken);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', nextToken);
      localStorage.removeItem('token');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (isRegister && !trimmedName) {
      toast.error('Enter your name');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (!password) {
      toast.error('Enter your password');
      return;
    }
    if (isRegister && password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (isRegister && !agreed) {
      toast.error('Please accept the Terms and Privacy Policy');
      return;
    }
    setSubmitting(true);
    const url = isRegister ? '/api/user/register' : '/api/user/login'

    try {
      const { data } = await axios.post(url, { name: trimmedName, email: trimmedEmail, password })

      if (data.success) {
        setToken(data.token)
        persistToken(data.token)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false);
    }
  }

  const finishSocial = (token) => {
    setToken(token)
    persistToken(token)
    toast.success('Welcome to Chaty')
  }

  const { socialLoading, handleGoogle, handleApple } = useSocialAuth({ axios, onToken: finishSocial })

  return (
    <section className="min-h-screen w-full bg-cream p-3 text-ink antialiased [font-synthesis:none] dark:bg-coal dark:text-[#f5f1e8]">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 lg:grid-cols-[0.96fr_1.04fr]">
        {/* ——— Left: the desk ——— */}
        <AuthPanel reduceMotion={reduceMotion}>
          <Motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <p className="text-ink dark:text-[#f5f1e8]">
              <LogoWordmark />
            </p>
          </Motion.div>

          <AuthHero isRegister={isRegister} state={state} reduceMotion={reduceMotion} />

          <SocialAuthButtons
            isRegister={isRegister}
            socialLoading={socialLoading}
            onGoogle={handleGoogle}
            onApple={handleApple}
            googleConfigured={googleConfigured}
            appleConfigured={appleConfigured}
          />

          <EmailAuthForm
            state={state}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            agreed={agreed}
            setAgreed={setAgreed}
            submitting={submitting}
            onSubmit={handleSubmit}
            reduceMotion={reduceMotion}
          />

          <div className="mt-6">
            <p className="text-sm text-black/60 dark:text-white/55">
              {isRegister ? (
                <>Already have an account?{' '}<button onClick={() => setState("login")} className="cursor-pointer font-medium text-black underline decoration-[#fc7819] decoration-2 underline-offset-4 hover:no-underline dark:text-white">Log in</button></>
              ) : (
                <>New here?{' '}<button onClick={() => setState("register")} className="cursor-pointer font-medium text-black underline decoration-[#fc7819] decoration-2 underline-offset-4 hover:no-underline dark:text-white">Make an account</button></>
              )}
            </p>
          </div>
        </AuthPanel>

        {/* ——— Right: the darkroom ——— */}
        <DarkroomPanel wordIndex={wordIndex} reduceMotion={reduceMotion} onStart={() => setState("register")} />
      </div>
    </section>
  );
}

export default Login;
