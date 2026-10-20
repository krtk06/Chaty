import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, Moon, Plus, Search, Settings, Sun } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { timeAgo } from '../lib/timeAgo'
import User from "../icons/User";
import Flame from '../icons/Credits';
import Album from '../icons/Images';
import Delete from '../icons/Delete';
import toast from 'react-hot-toast';
import { LogoTile, LogoWordmark } from './Logo';

const navItemClass = (active, collapsed) =>
  `flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ${active
    ? 'border-[#fc7819]/60 bg-[#fc7819]/[0.08] dark:bg-[#fc7819]/10'
    : 'border-transparent bg-white/60 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.07]'} ${collapsed ? 'md:justify-center' : ''}`

function DeleteChatButton({ chat, confirmed, onDelete }) {
  return (
    <button
      type="button"
      onClick={(e) => onDelete(e, chat._id)}
      title={confirmed ? 'Click again to confirm' : 'Delete chat'}
      aria-label={confirmed ? 'Confirm delete chat' : 'Delete chat'}
      className={`shrink-0 cursor-pointer rounded-md px-1.5 py-1 text-center text-xs ${confirmed ? 'bg-ink text-paper dark:bg-[#f5f1e8] dark:text-coal' : 'hidden group-hover:block group-focus-within:block focus-visible:block'}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <Motion.span
          key={confirmed ? 'sure' : 'trash'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="block min-w-[28px]"
        >
          {confirmed ? 'Sure?' : <Delete className="w-4 not-dark:invert" />}
        </Motion.span>
      </AnimatePresence>
    </button>
  )
}

function ChatListItem({ chat, index, active, confirmed, onPick, onDelete }) {
  const preview = chat.messages.length > 0
    ? chat.messages[0].content.slice(0, 32) + (chat.messages[0].content.length > 32 ? '...' : '')
    : chat.name

  return (
    <Motion.div
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30, delay: Math.min(index * 0.03, 0.3) }}
      className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border p-2 px-3 transition-colors ${active ? 'border-[#fc7819]/60 bg-[#fc7819]/[0.08] dark:bg-[#fc7819]/10' : 'border-transparent bg-white/60 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.07]'}`}
    >
      {active && (
        <Motion.span
          layoutId="active-chat-bar"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className="absolute top-2 bottom-2 left-0 w-1 rounded-full bg-[#fc7819]"
        />
      )}
      <Motion.button
        type="button"
        onClick={() => onPick(chat)}
        title={preview}
        whileHover={{ x: 3 }}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 pl-1 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block w-full truncate text-sm font-medium">{preview}</span>
          <span className="block text-xs text-black/50 dark:text-white/45">
            {timeAgo(chat.updatedAt)}
          </span>
        </span>
      </Motion.button>
      <DeleteChatButton chat={chat} confirmed={confirmed} onDelete={onDelete} />
    </Motion.div>
  )
}

function SidebarHeader({
  sidebarCollapsed, onToggleCollapse, onCloseMenu, onNewChat, search, onSearchChange, searchRef,
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 p-4">
        <a href='/' className='min-w-0 text-ink dark:text-[#f5f1e8]' title='Chaty'>
          <LogoWordmark />
        </a>
        <div className={`flex items-center gap-1 ${sidebarCollapsed ? 'md:w-full' : ''}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden cursor-pointer items-center justify-center rounded-[10px] border border-black/15 transition-colors hover:border-[#fc7819]/50 hover:text-[#fc7819] md:flex dark:border-white/15 ${sidebarCollapsed ? 'h-10 w-full' : 'h-8 w-8'}`}
          >
            <ChevronLeft className={`size-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            aria-label='Close menu'
            className='cursor-pointer md:hidden'
            onClick={onCloseMenu}
          >
            <img src={assets.close_icon} className='h-5 w-5 not-dark:invert' alt='' />
          </button>
        </div>
      </div>

      <div className={`px-4 ${sidebarCollapsed ? 'md:px-3' : ''}`}>
        <Motion.button
          type="button"
          onClick={onNewChat}
          title='New Chat'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className={`group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-ink py-2.5 text-sm font-semibold text-paper transition-shadow hover:shadow-[0_12px_30px_-12px_rgba(252,120,25,0.55)] dark:bg-[#f5f1e8] dark:text-coal ${sidebarCollapsed ? 'md:h-11 md:py-0 md:px-0' : ''}`}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#fc7819]/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className={`${sidebarCollapsed ? 'md:mr-0' : 'mr-2'} leading-none`} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M8 2.5v11M2.5 8h11" />
            </svg>
          </span>
          <span className={sidebarCollapsed ? 'md:hidden' : ''}>New Chat</span>
        </Motion.button>
      </div>

      {(!sidebarCollapsed) && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-transparent bg-black/[0.04] p-3 transition-colors focus-within:border-[#fc7819]/60 focus-within:bg-white max-md:flex dark:bg-white/[0.06] dark:focus-within:bg-white/[0.08]">
          <Search className="size-4 shrink-0 text-black/40 dark:text-white/40" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search conversations"
            aria-label="Search conversations"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/30 dark:placeholder:text-white/35"
          />
        </div>
      )}
      {sidebarCollapsed && (
        <div className="mt-3 hidden justify-center px-3 md:flex">
          <button
            type="button"
            onClick={onToggleCollapse}
            title='Search conversations'
            aria-label='Search conversations'
            className='flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-black/15 transition-colors hover:border-[#fc7819]/50 hover:text-[#fc7819] dark:border-white/15'
          >
            <Search className="size-4" />
          </button>
        </div>
      )}
    </>
  )
}

function SidebarNav({ pathname, collapsed, theme, setTheme, user, initial, go, logout }) {
  return (
    <div className={`space-y-1.5 p-4 ${collapsed ? 'md:p-3' : ''}`}>
      <Motion.button
        type="button"
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={navItemClass(pathname === '/community', collapsed)}
        onClick={() => go('/community')}
        title='Community Images'
      >
        <Album className="w-4.5 shrink-0 not-dark:invert" />
        <p className={`text-sm font-medium ${collapsed ? 'md:hidden' : ''}`}>Community Images</p>
      </Motion.button>

      <Motion.button
        type="button"
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={navItemClass(pathname === '/credits', collapsed)}
        onClick={() => go('/credits')}
        title={`Credits: ${user?.credits ?? 0}`}
      >
        <Flame className="w-5 shrink-0 invert-0 not-dark:invert" />
        <span className={`flex min-w-0 flex-col text-sm ${collapsed ? 'md:hidden' : ''}`}>
          <span className="text-sm font-semibold tabular-nums">Credits: {user?.credits}</span>
          <span className="text-xs text-black/55 dark:text-white/45">Get more credits</span>
        </span>
      </Motion.button>

      <Motion.button
        type="button"
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={navItemClass(pathname === '/settings', collapsed)}
        onClick={() => go('/settings')}
        title='Profile & settings'
      >
        <Settings className="w-4.5 shrink-0 not-dark:invert" />
        <p className={`text-sm font-medium ${collapsed ? 'md:hidden' : ''}`}>Settings</p>
      </Motion.button>

      {!collapsed ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-transparent bg-white/60 p-3 max-md:flex dark:bg-white/[0.03]">
          <div className='flex items-center gap-2 text-sm font-medium'>
            <span className="relative flex size-5 items-center justify-center">
              <Sun className="size-4 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
              <Moon className="size-4 absolute transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
            </span>
            <p>Dark Mode</p>
          </div>
          <label className='relative inline-flex cursor-pointer'>
            <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              type='checkbox' aria-label='Dark mode' className='peer sr-only' checked={theme === 'dark'} />
            <div className='h-5 w-9 rounded-full bg-black/20 transition-all peer-checked:bg-[#fc7819] dark:bg-white/20'></div>
            <span className='absolute top-1 left-1 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-4'></span>
          </label>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className='hidden h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-transparent bg-white/60 transition-colors hover:border-[#fc7819]/50 hover:text-[#fc7819] md:flex dark:bg-white/[0.03]'
        >
          <span className="relative flex size-4 items-center justify-center">
            <Sun className="size-4 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
            <Moon className="size-4 absolute transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
          </span>
        </button>
      )}

      <div className={`group flex h-12 items-center rounded-xl border border-transparent bg-white/60 transition-colors hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.07] ${collapsed ? 'md:justify-center' : ''}`}>
        <button
          type="button"
          onClick={() => user && go('/settings')}
          title={user ? 'Profile & settings' : 'Login your account'}
          className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-3 text-left ${collapsed ? 'md:justify-center' : ''}`}
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper dark:bg-[#fc7819] dark:text-black"
            style={user?.avatar ? { backgroundColor: user.avatar, color: '#fff' } : undefined}
          >
            {user ? initial : <User className="w-4" />}
          </span>
          <span className={`flex-1 truncate text-sm font-medium ${collapsed ? 'md:hidden' : ''}`}>{user ? user.name : 'Login your account'}</span>
        </button>
        {user && (
          <button
            type="button"
            onClick={logout}
            title='Log out'
            aria-label='Log out'
            className="mr-3 hidden cursor-pointer text-black/50 transition-colors hover:text-[#fc7819] group-hover:block group-focus-within:block focus-visible:block dark:text-white/50"
          >
            <LogOut className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { chats, selectedChat, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, logout, sidebarCollapsed, setSidebarCollapsed, token } = useAppContext()

  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const searchRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const onKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSidebarCollapsed(false)
        setTimeout(() => searchRef.current?.focus(), 60)
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [setSidebarCollapsed])

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation()
      if (confirmDeleteId !== chatId) {
        setConfirmDeleteId(chatId)
        setTimeout(() => setConfirmDeleteId(prev => prev === chatId ? null : prev), 3000)
        return
      }
      setConfirmDeleteId(null)
      const { data } = await axios.post('/api/chat/delete', { chatId }, { headers: { Authorization: token } })
      if (data.success) {
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        await fetchUsersChats()
        toast.success(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) ||
    chat.name.toLowerCase().includes(search.toLowerCase())
  )

  const go = (path) => { navigate(path); setIsMenuOpen(false) }
  const pickChat = (chat) => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }
  const initial = (user?.name || 'C').trim().charAt(0).toUpperCase()

  if (sidebarCollapsed && !isMenuOpen) {
    return (
      <CollapsedRail
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onExpand={() => setSidebarCollapsed(false)}
        onNewChat={createNewChat}
        onCommunity={() => go('/community')}
        onCredits={() => go('/credits')}
        onSettings={() => go('/settings')}
        pathname={pathname}
        credits={user?.credits}
        userName={user?.name}
        avatar={user?.avatar}
        initial={initial}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onLogout={logout}
        hasUser={!!user}
      />
    )
  }

  return (
    <div className={`flex h-screen shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-paper transition-[width,transform] duration-300 max-md:absolute left-0 z-50 max-md:w-72 md:w-72 dark:border-white/10 dark:bg-ember ${!isMenuOpen && 'max-md:-translate-x-full'}`}>
      <SidebarHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMenu={() => setIsMenuOpen(false)}
        onNewChat={createNewChat}
        search={search}
        onSearchChange={setSearch}
        searchRef={searchRef}
      />

      <div className={`mt-4 flex-1 space-y-1.5 overflow-y-auto px-4 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
        {chats.length > 0 ? (
          <>
            <p className="px-1 text-[11px] font-semibold tracking-[0.12em] text-black/45 uppercase dark:text-white/40">
              Recent · {filteredChats.length}
            </p>
            {filteredChats.length === 0 && (
              <p className="text-sm text-black/60 dark:text-white/55">No matches for “{search}”.</p>
            )}
            {filteredChats.map((chat, i) => (
              <ChatListItem
                key={chat._id || chat.id}
                chat={chat}
                index={i}
                active={selectedChat?._id === chat._id}
                confirmed={confirmDeleteId === chat._id}
                onPick={pickChat}
                onDelete={deleteChat}
              />
            ))}
          </>
        ) : (
          <div className="text-sm text-black/60 dark:text-white/55">
            <p className="font-medium text-black/60 dark:text-white/55">No chats yet</p>
            <p className="mt-1">Start a new chat to begin.</p>
          </div>
        )}
      </div>

      <SidebarNav
        pathname={pathname}
        collapsed={sidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        user={user}
        initial={initial}
        go={go}
        logout={logout}
      />
    </div>
  )
}

function RailButton({ label, onClick, active, title, children }) {
  return (
    <Motion.button
      type="button"
      onClick={onClick}
      title={title || label}
      aria-label={label}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 450, damping: 22 }}
      className={`group relative flex size-11 cursor-pointer items-center justify-center rounded-2xl transition-colors ${
        active
          ? 'bg-[#fc7819] text-black shadow-[0_0_22px_rgba(252,120,25,0.5)]'
          : 'text-black/55 hover:bg-black/[0.05] hover:text-black dark:text-white/55 dark:hover:bg-white/[0.08] dark:hover:text-white'
      }`}
    >
      {children}
      <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-paper opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-[#f5f1e8] dark:text-coal" style={{ translate: '-4px 0' }}>
        {label}
      </span>
    </Motion.button>
  );
}

function RailDivider() {
  return <div aria-hidden="true" className="mx-3 h-px bg-black/10 dark:bg-white/10" />;
}

function CollapsedRail({
  isMenuOpen,
  onExpand,
  onNewChat,
  onCommunity,
  onCredits,
  onSettings,
  pathname,
  credits,
  userName,
  avatar,
  initial,
  theme,
  onToggleTheme,
  onLogout,
  hasUser,
}) {
  return (
    <Motion.div
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex h-screen w-[76px] shrink-0 flex-col items-center gap-1.5 overflow-y-auto border-r border-black/10 bg-paper py-4 transition-transform duration-300 max-md:absolute max-md:left-0 max-md:z-50 dark:border-white/10 dark:bg-ember ${!isMenuOpen && 'max-md:-translate-x-full'}`}
    >
      <a href="/" title="Chaty" aria-label="Chaty home">
        <LogoTile className="transition-transform duration-300 hover:scale-105" />
      </a>

      <RailButton label="Expand sidebar" onClick={onExpand}>
        <ChevronRight className="size-5" />
      </RailButton>

      <RailDivider />

      <Motion.button
        type="button"
        onClick={onNewChat}
        title="New Chat"
        aria-label="New Chat"
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="group relative flex size-11 cursor-pointer items-center justify-center rounded-full bg-ink text-paper shadow-[0_8px_24px_-8px_rgba(28,25,23,0.6)] dark:bg-[#f5f1e8] dark:text-coal"
      >
        <Plus className="size-5" />
        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[#f5f1e8] dark:text-coal">
          New Chat
        </span>
      </Motion.button>

      <RailButton label="Search conversations" onClick={onExpand}>
        <Search className="size-5" />
      </RailButton>

      <RailDivider />

      <RailButton label="Community Images" onClick={onCommunity} active={pathname === '/community'}>
        <Album className="w-5 not-dark:invert" />
      </RailButton>

      <RailButton label={`Credits: ${credits ?? 0}`} title={`Credits: ${credits ?? 0} — Get more credits`} onClick={onCredits} active={pathname === '/credits'}>
        <Flame className="w-5 invert-0 not-dark:invert" />
      </RailButton>

      <RailButton label="Settings" onClick={onSettings} active={pathname === '/settings'}>
        <Settings className="w-5" />
      </RailButton>

      <RailButton
        label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={onToggleTheme}
      >
        <span className="relative flex size-5 items-center justify-center">
          <Sun className="absolute size-5 transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
        </span>
      </RailButton>

      <div className="flex-1" />

      <RailDivider />

      <div className="group relative">
        <span
          title={userName || 'Login your account'}
          className="font-logo flex size-11 items-center justify-center rounded-2xl bg-[#fc7819] text-lg text-black shadow-[0_0_22px_rgba(252,120,25,0.45)]"
          style={avatar ? { backgroundColor: avatar, color: '#fff' } : undefined}
        >
          {hasUser ? initial : <User className="w-4" />}
        </span>
        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[#f5f1e8] dark:text-coal">
          {userName || 'Login your account'}
        </span>
      </div>

      {hasUser && (
        <RailButton label="Log out" onClick={onLogout}>
          <LogOut className="size-4" />
        </RailButton>
      )}
    </Motion.div>
  );
}

export default Sidebar
