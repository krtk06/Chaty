import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Community from './pages/Community'
import Credits from './pages/Credits'
import Login from './pages/Login'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import { Toaster } from 'react-hot-toast'



export default function App() {

  const { user, loadingUser } = useAppContext()

  const { pathname } = useLocation()

  if (pathname === '/loading' || loadingUser) return <Loading />
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <>
    <Toaster/>
      {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden dark:invert'
        onClick={() => setIsMenuOpen(true)} />}

      {user ? (
        <div className='dark:bg-gradient-to-b from-[#141414] to-[#000000] dark:text-white'>
          <div className='flex h-screen w-screen'>
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path='/' element={<ChatBox />} />
              <Route path='/community' element={<Community />} />
              <Route path='/credits' element={<Credits />} />
              <Route path='/login' element={<Login />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className='bg-gradient-to-b from-[#212121] to-[#141414] flex items-center justify-center h-screen w-screen'>
          <Login />
        </div>
      )}

    </>
  )
}