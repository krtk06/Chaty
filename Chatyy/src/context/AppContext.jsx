import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast';


axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token') || null)
  const [loadingUser,setLoadingUser] = useState(() => Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem('sidebarCollapsed') !== 'false')

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setChats([])
    setSelectedChat(null)
  }, [])

  const fetchUser = useCallback(async () => {
    if (!token) {
      return null
    }
    try {
      const {data} = await axios.get('/api/user/data', {headers: {Authorization: token}})
      if(data.success){
        setUser(data.user)
        return data.user
      }
      toast.error(data.message)
      return null
    } catch (error) {
      if (error.response?.status === 401) {
        clearSession()
        toast.error('Session expired, please log in again')
      } else {
        toast.error(error.message)
      }
      return null
    } finally {
      setLoadingUser(false)
    }
  }, [token, clearSession])

  const fetchUsersChats = useCallback(async ({ ensureOne = false } = {}) => {
    try {
      const {data} = await axios.get('/api/chat/get', { headers: { Authorization: token } })
      if(!data.success){
        toast.error(data.message)
        return []
      }

      if(data.chats.length === 0 && ensureOne){
        // First visit: every account should always have one chat to land in.
        const created = await axios.get('/api/chat/create', { headers: { Authorization: token } })
        const createdChat = created.data?.chat || null
        const chatsList = createdChat ? [createdChat] : []
        setChats(chatsList)
        setSelectedChat(prev => prev || createdChat)
        return chatsList
      }

      setChats(data.chats)
      setSelectedChat(prev => {
        if (prev) {
          const refreshed = data.chats.find(chat => chat._id === prev._id)
          if (refreshed) return refreshed
        }
        return data.chats[0] || null
      })
      return data.chats
    } catch (error) {
      toast.error(error.message)
      return []
    }
  }, [token])


  const createNewChat = useCallback(async () => {
    if(!user) {
      toast('Login to create a new chat')
      return null
    }
    try {
        navigate('/')
        const {data} = await axios.get('/api/chat/create', {headers: {Authorization: token}})
        if(!data.success){
          toast.error(data.message)
          return null
        }
        await fetchUsersChats()
        // New chats must become the active chat, unlike passive list refreshes.
        if (data.chat) setSelectedChat(data.chat)
        return data.chat || null
    } catch (error) {
        toast.error(error.message)
        return null
    }
  }, [user, token, navigate, fetchUsersChats])

  const logout = useCallback(() => {
    clearSession()
    toast.success('Logged out successfully')
  }, [clearSession])

  useEffect(() => {
    if(token){
      // Load the profile on login; fetchUser updates state after its await.
      // oxlint-disable-next-line react/set-state-in-effect
      fetchUser()
    }
  }, [token, fetchUser])

  const userId = user?._id

  useEffect(() => {
    if (userId) {
      // Load the chat list once the profile resolves.
      // oxlint-disable-next-line react/set-state-in-effect
      fetchUsersChats({ ensureOne: true })
    }
  }, [userId, fetchUsersChats])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme',theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed)
  }, [sidebarCollapsed])

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUsersChats,
    token,
    setToken,
    axios,
    sidebarCollapsed,
    setSidebarCollapsed,
    logout
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  return useContext(AppContext)
}
