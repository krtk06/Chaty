import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import User from "../icons/User";
import Flame from '../icons/Credits';
import Album from '../icons/Images';
import Delete from '../icons/Delete';
import toast from 'react-hot-toast';

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
      const { data } = await axios.post('api/chat/delete', { chatId }, { headers: { Authorization: token } })
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
    <div className={`flex flex-col h-screen min-w-72 p-5 overflow-y-auto dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#000000] border-r border-[#80609f]/30  backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-50 ${!isMenuOpen && 'max-md:-translate-x-full'}`}>
      <a href='/' className='w-auto h-17 max-w-48 object-contain'>
        <img
          src={theme === 'dark' ? assets.my_logo1 : assets.my_logo2}
          alt="Logo"
          className="w-auto h-17 max-w-48 object-contain"
        />
      </a>


      <button onClick={createNewChat} className="flex justify-center items-center w-full py-2 mt-10 bg-[#313131]/30 not-dark:bg-[#141414] text-white rounded-md text-sm cursor-pointer">
        <span className="mr-2 text-xl">+</span>
        New Chat
      </button>

      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
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
          className="text-sm placeholder:text-gray-400 outline-none"
        />
      </div>

      {chats.length > 0 && (
        <>
          <p className="mt-4 text-sm">Recent Chats</p>
          <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
            {chats
              .filter(chat =>
                chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) ||
                chat.name.toLowerCase().includes(search.toLowerCase())
              )
              .map(chat => (
                <div onClick={() => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }}
                  key={chat._id || chat.id} className="flex justify-between p-2 px-4 dark:bg-[#141414]/10 border border-gray-300 dark:border-white/20 rounded-md group cursor-pointer">
                  <div className="flex-1">
                    <p className="truncate w-full">
                      {chat.messages.length > 0
                        ? chat.messages[0].content.slice(0, 32) + '...'
                        : chat.name
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                      {moment(chat.updatedAt).fromNow()}
                    </p>
                  </div>
                  <Delete onClick={e => toast.promise(deleteChat(e, chat._id), { loading: 'Deleting...' })} className="hidden group-hover:block w-4 cursor-pointer not-dark:invert" />
                </div>
              ))
            }
          </div>
        </>
      )}

      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all"
        onClick={() => { navigate('/community'); setIsMenuOpen(false) }}
      >
        <Album className="w-4.5 not-dark:invert" />
        <div className="flex flex-col text-sm">
          <p className="text-sm">Community Images</p>
        </div>
      </div>

      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all"
        onClick={() => { navigate('/credits'); setIsMenuOpen(false) }}
      >
        <Flame className="w-5 invert-0 not-dark:invert" />
        <div className="flex flex-col text-sm">
          <p className="text-sm">Credits: {user?.credits}</p>
          <p className="text-xs text-gray-400">Purchase credits to use Chaty</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md">
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} alt='' className="w-4 not-dark:invert" />
          <p>Dark Mode</p>
        </div>
        <label className='relative inline-flex cursor-pointer'>
          <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            type='checkbox' className='sr-only peer' checked={theme === 'dark'} />
          <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-blue-900 transition-all'></div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
        </label>
      </div>
      <div
        className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all group"
      >
        <User className="w-4 not-dark:invert" />
        <p className='flex-1 text-sm dark:text-white truncate'>{user ? user.name : 'Login your account'}</p>
        {user && <img onClick={logout} src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block' />}

      </div>
      <img src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert'
        alt=''
        onClick={() => setIsMenuOpen(false)}
      >
      </img>

    </div>
  )
}

export default Sidebar
