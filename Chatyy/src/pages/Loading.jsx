import { useEffect } from 'react'
import { motion as Motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { fetchUser, user } = useAppContext()

  // After a Stripe checkout the app lands here; wait (briefly) for the
  // webhook to credit the account before returning to the chat.
  useEffect(() => {
    if (pathname !== '/loading') return

    let cancelled = false
    let timer
    const before = user?.credits ?? null

    const poll = async (attempt) => {
      const fresh = await fetchUser()
      if (cancelled) return
      if (fresh && (before == null || (fresh.credits ?? 0) > before)) {
        navigate('/')
        return
      }
      if (attempt >= 7) {
        navigate('/')
        return
      }
      timer = setTimeout(() => poll(attempt + 1), 1200)
    }

    poll(0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className="bg-cream dark:bg-coal flex items-center justify-center h-screen w-screen antialiased">
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center">
        <span className="relative flex size-14 items-center justify-center">
          <Motion.span
            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl bg-[#fc7819]/50"
          />
          <Motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-2xl border border-dashed border-[#fc7819]/70"
          />
          <span className="relative flex size-14 items-center justify-center rounded-2xl bg-[#fc7819] text-2xl font-bold text-black">
            ✦
          </span>
        </span>
        <p className="mt-6 text-black dark:text-white"><LogoWordmark className="text-2xl" /></p>

        <h2 className="mt-2 text-sm text-black/60 dark:text-white/55">
          Warming up the studio…
        </h2>
      </Motion.div>
    </div>
  )
}

export default Loading
