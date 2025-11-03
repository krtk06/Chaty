import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import Loading from './Loading'

const AVATAR_COLORS = ['#0e5fd4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const Settings = () => {
  const { user, setUser, theme, setTheme, axios, token, navigate, loadingUser } = useAppContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [avatarColorIndex, setAvatarColorIndex] = useState(0)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      if (user.avatar) {
        const idx = AVATAR_COLORS.indexOf(user.avatar)
        if (idx !== -1) setAvatarColorIndex(idx)
      }
    }
  }, [user])

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const cycleAvatar = () => {
    const next = (avatarColorIndex + 1) % AVATAR_COLORS.length
    setAvatarColorIndex(next)
    const color = AVATAR_COLORS[next]
    axios.put('/api/user/update', { avatar: color }, { headers: { Authorization: token } })
      .then(({ data }) => {
        if (data.success) {
          setUser(prev => ({ ...prev, avatar: color }))
          toast.success('Avatar updated')
        }
      })
      .catch(() => {})
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await axios.put('/api/user/update', { name, email }, { headers: { Authorization: token } })
      if (data.success) {
        setUser(prev => ({ ...prev, name, email }))
        toast.success('Profile updated')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setSaving(true)
    try {
      const { data } = await axios.put('/api/user/update', { currentPassword, newPassword }, { headers: { Authorization: token } })
      if (data.success) {
        toast.success('Password changed')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setSaving(false)
  }

  if (loadingUser || !user) return <Loading />

  return (
    <div className="h-full p-6 bg-white dark:bg-[#141414] overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <button
            onClick={cycleAvatar}
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 ring-4 ring-white/20 hover:ring-white/40 transition-all cursor-pointer"
            style={{ backgroundColor: user.avatar || AVATAR_COLORS[avatarColorIndex] }}
          >
            {getInitials(user.name)}
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click avatar to change color</p>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-gray-800 dark:text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-gray-300 dark:border-neutral-700 focus:border-[#0e5fd4] focus:outline-none transition-colors placeholder-neutral-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-gray-800 dark:text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-gray-300 dark:border-neutral-700 focus:border-[#0e5fd4] focus:outline-none transition-colors placeholder-neutral-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0e5fd4] hover:bg-[#0b4fb3] text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-transparent text-gray-800 dark:text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-gray-300 dark:border-neutral-700 focus:border-[#0e5fd4] focus:outline-none transition-colors placeholder-neutral-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent text-gray-800 dark:text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-gray-300 dark:border-neutral-700 focus:border-[#0e5fd4] focus:outline-none transition-colors placeholder-neutral-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-gray-800 dark:text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-gray-300 dark:border-neutral-700 focus:border-[#0e5fd4] focus:outline-none transition-colors placeholder-neutral-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0e5fd4] hover:bg-[#0b4fb3] text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input
                  onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  type="checkbox"
                  className="sr-only peer"
                  checked={theme === 'dark'}
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#0e5fd4] transition-all" />
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Account</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 text-gray-600 dark:text-white not-dark:invert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Community Images</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Browse shared images</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/community')}
                  className="bg-[#0e5fd4] hover:bg-[#0b4fb3] text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer"
                >
                  Browse
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 text-gray-600 dark:text-white not-dark:invert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Credits</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.credits || 0} credits remaining</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/credits')}
                  className="bg-[#0e5fd4] hover:bg-[#0b4fb3] text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer"
                >
                  Buy More
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Help & Support</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Need assistance? Reach out to our support team at{' '}
              <a href="mailto:support@chatyy.com" className="text-[#0e5fd4] hover:underline">support@chatyy.com</a>
              {' '}or check the FAQ section for common questions.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-10 pb-8">
          Chatyy v1.0.0
        </p>
      </div>
    </div>
  )
}

export default Settings
