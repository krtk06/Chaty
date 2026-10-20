import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const AVATAR_COLORS = ['#fc7819', '#1c1917', '#2563eb', '#16a34a', '#9333ea', '#dc2626', '#0891b2']

const Settings = () => {
  const { user, setUser, axios, token } = useAppContext()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || '#fc7819')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const body = { name, email, avatar }
      if (newPassword) {
        body.password = newPassword
        body.currentPassword = currentPassword
      }
      const { data } = await axios.put('/api/user/update', body, { headers: { Authorization: token } })
      if (data.success) {
        setUser(data.user)
        setCurrentPassword('')
        setNewPassword('')
        toast.success('Profile updated')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const initial = (user?.name || 'C').trim().charAt(0).toUpperCase()

  return (
    <div className="h-full w-full flex-1 overflow-y-auto bg-cream p-6 pt-12 dark:bg-coal xl:px-12">
      <div className="mx-auto max-w-2xl">
        <Motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl font-medium tracking-[-0.03em] text-black dark:text-white"
        >
          Profile & <em className="font-editorial italic">settings</em>
        </Motion.h1>
        <Motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-black/60 dark:text-white/55"
        >
          Update your name, email, avatar color, or password.
        </Motion.p>

        <form onSubmit={saveProfile} className="mt-8 space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50 dark:text-white/45">Avatar color</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className="flex size-11 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: avatar }}
              >
                {initial}
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use avatar color ${color}`}
                    onClick={() => setAvatar(color)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-full ring-offset-2 transition-all focus-visible:ring-2 focus-visible:ring-[#fc7819] dark:ring-offset-[#12100d]"
                    style={{ backgroundColor: color, boxShadow: avatar === color ? '0 0 0 2px #fc7819' : 'none' }}
                  >
                    {avatar === color && <Check className="size-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <label className="block">
              <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50 dark:text-white/45">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-[15px] text-black outline-none transition-colors focus:border-[#fc7819]/70 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50 dark:text-white/45">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-[15px] text-black outline-none transition-colors focus:border-[#fc7819]/70 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
              />
            </label>
          </div>

          <div className="space-y-4 rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50 dark:text-white/45">Change password</p>
            <label className="block">
              <span className="text-sm text-black/60 dark:text-white/55">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-[15px] text-black outline-none transition-colors focus:border-[#fc7819]/70 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-black/60 dark:text-white/55">New password (8+ characters)</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-[15px] text-black outline-none transition-colors focus:border-[#fc7819]/70 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-12 w-full cursor-pointer rounded-xl bg-ink text-[15px] font-medium text-paper transition-shadow hover:shadow-[0_14px_30px_-14px_rgba(28,25,23,0.7)] disabled:cursor-wait disabled:opacity-60 dark:bg-[#f5f1e8] dark:text-coal"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-black/10 pt-6 text-sm dark:border-white/10">
          <Link
            to="/terms"
            className="text-black/50 underline decoration-[#fc7819] decoration-2 underline-offset-4 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            to="/privacy"
            className="text-black/50 underline decoration-[#fc7819] decoration-2 underline-offset-4 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </div>
  )
}

export default Settings
