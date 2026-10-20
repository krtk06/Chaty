import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Community from './pages/Community'
import Credits from './pages/Credits'
import Settings from './pages/Settings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import LegalPage from './components/pages/LegalPage'
import { terms } from './content/terms'
import { privacy } from './content/privacy'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import { Toaster } from 'react-hot-toast'

const legalRoutes = {
  '/terms': {
    doc: terms,
    updated: terms.updated,
    companyName: terms.companyName,
    contactEmail: terms.contactEmail,
    siblings: [{ to: '/privacy', label: 'Privacy Policy' }],
  },
  '/privacy': {
    doc: privacy,
    updated: privacy.updated,
    companyName: privacy.companyName,
    contactEmail: privacy.contactEmail,
    siblings: [{ to: '/terms', label: 'Terms & Conditions' }],
  },
}

// Routes that live inside the app shell.
const appPaths = ['/', '/community', '/credits', '/settings', '/login']

export default function App() {
  const { user, loadingUser } = useAppContext()
  const { pathname } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const legal = legalRoutes[pathname]
  const isAppPath = appPaths.includes(pathname)

  // Legal pages and the 404 page are full-screen, outside the app shell.
  if (legal) {
    return (
      <>
        <Toaster toastOptions={{ style: { borderRadius: '10px', fontSize: '14px', maxWidth: '380px', wordBreak: 'break-word' } }} />
        <Routes>
          <Route path='/terms' element={<LegalPage {...legalRoutes['/terms']} />} />
          <Route path='/privacy' element={<LegalPage {...legalRoutes['/privacy']} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </>
    )
  }

  if (!isAppPath) {
    return (
      <>
        <Toaster toastOptions={{ style: { borderRadius: '10px', fontSize: '14px', maxWidth: '380px', wordBreak: 'break-word' } }} />
        <NotFound />
      </>
    )
  }

  if (pathname === '/loading' || loadingUser) return <Loading />

  return (
    <>
    <Toaster toastOptions={{
      style: { borderRadius: '10px', fontSize: '14px', maxWidth: '380px', wordBreak: 'break-word' },
    }} />
      {!isMenuOpen && (
        <button
          type="button"
          aria-label="Open menu"
          className='absolute top-3 left-3 z-20 cursor-pointer md:hidden'
          onClick={() => setIsMenuOpen(true)}
        >
          <img src={assets.menu_icon} className='h-8 w-8 not-dark:invert' alt='' />
        </button>
      )}

      {user ? (
        <div className='bg-cream text-ink dark:bg-coal dark:text-[#f5f1e8] antialiased'>
          <div className='flex h-screen w-screen overflow-hidden'>
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path='/' element={<ChatBox />} />
              <Route path='/community' element={<Community />} />
              <Route path='/credits' element={<Credits />} />
              <Route path='/settings' element={<Settings />} />
              <Route path='/login' element={<Login />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className='bg-cream dark:bg-coal flex items-center justify-center min-h-screen w-screen antialiased'>
          <Login />
        </div>
      )}

    </>
  )
}
