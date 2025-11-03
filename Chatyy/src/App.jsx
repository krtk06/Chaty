import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Community from './pages/Community'
import Credits from './pages/Credits'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import { Toaster } from 'react-hot-toast'



export default function App() {

  const { user, loadingUser } = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 768)
  const { pathname } = useLocation()

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (pathname === '/loading' || loadingUser) return <Loading />
  return (
    <>
    <Toaster/>
      {!isMenuOpen && <img src={assets.menu_icon} className='fixed top-3 left-3 w-8 h-8 cursor-pointer not-dark:invert z-50'
        onClick={() => setIsMenuOpen(true)} />}

      {user ? (
        <div className='bg-white dark:bg-[#141414] dark:text-white'>
          <div className='h-screen w-screen'>
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <div className={`h-full flex flex-col transition-all duration-500 ${isMenuOpen ? 'ml-72' : 'ml-0'}`}>
              <Routes>
                <Route path='/' element={<ChatBox />} />
                <Route path='/community' element={<Community />} />
                <Route path='/credits' element={<Credits />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/login' element={<Login />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}

    </>
  )
}