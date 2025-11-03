import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import User from "../icons/User";
import Delete from '../icons/Delete';
import toast from 'react-hot-toast';
import { PanelLeftClose } from './animate-ui/icons/panel-left-close';

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, setToken, token } = useAppContext()

  const [search, setSearch] = useState('')


  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Logged out successfully')
  }


  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation()
      const confirm = window.confirm('Are you sure want to delete this chat? ')
      if (!confirm) {
        return
      }
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

  return (
    <div className={`fixed left-0 top-0 flex flex-col h-screen w-72 p-5 overflow-y-auto bg-gray-50 dark:bg-[#141414] border-r border-[#0e5fd4]/30 transition-all duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className='flex items-center justify-between'>
        <a href='/' className='w-auto h-16 max-w-48'>
          <img
            src={theme === 'dark' ? assets.my_logo1 : assets.my_logo2}
            alt="Logo"
            className="w-auto h-16 object-contain"
          />
        </a>
        <button onClick={() => setIsMenuOpen(false)} className='p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors'>
          <PanelLeftClose animateOnHover className="opacity-50" size={22} />
        </button>
      </div>


      <button onClick={createNewChat} className="flex justify-center items-center w-full py-2.5 mt-8 bg-[#0e5fd4] hover:bg-[#0b4fb3] text-white rounded-lg text-sm cursor-pointer transition-colors">
        <span className="mr-2 text-xl">+</span>
        New Chat
      </button>

      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/20 rounded-md focus-within:ring-2 focus-within:ring-[#0e5fd4]/40">
        <img
          src={assets.search_icon}
          alt="Search"
          className={`w-4 ${theme !== 'dark' ? 'invert' : ''}`}
        />
        <input
          type="text"
          placeholder="Search conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm placeholder:text-gray-400 outline-none bg-transparent w-full"
        />
      </div>

      {chats.length > 0 && (
        <>
          <p className="mt-4 text-sm">Recent Chats</p>
          <div className="flex-1 overflow-y-auto mt-3 text-sm space-y-3">
            {chats
              .filter(chat =>
                chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) ||
                chat.name.toLowerCase().includes(search.toLowerCase())
              )
              .map(chat => (
                <div onClick={() => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }}
                  key={chat._id || chat.id} className="flex justify-between p-2 px-4 dark:bg-[#141414]/10 border border-gray-200 dark:border-white/20 rounded-md group cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="truncate w-full">
                      {chat.messages.length > 0
                        ? chat.messages[0].content
                        : chat.name
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {moment(chat.updatedAt).fromNow()}
                    </p>
                  </div>
                  <Delete onClick={e => toast.promise(deleteChat(e, chat._id), { loading: 'Deleting...' })} className="hidden group-hover:block w-4 cursor-pointer not-dark:invert shrink-0" />
                </div>
              ))
            }
          </div>
        </>
      )}

      <div
        className="flex items-center gap-3 p-3 mt-2 border border-gray-200 dark:border-white/15 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        onClick={() => { navigate('/settings'); setIsMenuOpen(false) }}
      >
        <svg className="w-5 not-dark:invert text-gray-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm">Settings</p>
      </div>

      <div
        className="flex items-center gap-3 p-3 mt-2 border border-gray-200 dark:border-white/15 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
      >
        <User className="w-5 not-dark:invert" />
        <p className='flex-1 text-sm dark:text-white truncate'>{user ? user.name : 'Login your account'}</p>
        <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
          {user && <img onClick={logout} src={assets.logout_icon} className='h-5 cursor-pointer not-dark:invert' />}
        </div>
      </div>

    </div>
  )
}

export default Sidebar
