import React, { useState, useRef, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import Message from './Message'
import SendIcon from '../icons/SendIcon'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const { selectedChat, user, axios, token, setUser } = useAppContext()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [file, setFile] = useState(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const { pathname } = useLocation()


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast('Login to send message')

    if (mode === 'document') {
      if (!file) return toast('Please select a file')
      setLoading(true)
      const fileName = file.name
      setFile(null)
      setMessages(prev => [...prev, { role: 'user', content: input || `Analyze this document: ${fileName}`, timestamp: Date.now(), isImage: false, isDocument: true, fileName }])

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('chatId', selectedChat._id)
        formData.append('prompt', input)
        const { data } = await axios.post('/api/message/document', formData, {
          headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        })
        if (data.success) {
          setMessages(prev => [...prev, data.reply])
          setUser(prev => ({ ...prev, credits: prev.credits - 2 }))
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
        setInput('')
      }
      return
    }

    if (!input.trim()) return
    setLoading(true)
    const inputCopy = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: inputCopy, timestamp: Date.now(), isImage: false }])

    try {
      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt: inputCopy, isPublic },
        { headers: { Authorization: token } }
      )
      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        if (mode === 'image') {
          setUser(prev => ({ ...prev, credits: prev.credits - 2 }))
        } else {
          setUser(prev => ({ ...prev, credits: prev.credits - 1 }))
        }
      } else {
        toast.error(data.message)
        setInput(inputCopy)
      }
    } catch (error) {
      toast.error(error.message)
      setInput(inputCopy)
    } finally {
      setLoading(false)
    }
  }

  useLayoutEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useLayoutEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Chaty</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a chat from the sidebar or create a new one to get started
          </p>
        </div>
      </div>
    )
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  return (
    <div className="flex-1 flex flex-col justify-between px-5 md:px-10 pb-5 md:pb-8 dark:bg-[#141414]">
      <div ref={containerRef}
        className="flex-1 overflow-y-auto dark:bg-[#141414]">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Message key={message._id || message.timestamp} message={message} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-200">Ask me anything</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start a conversation
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-xs">
              <div className="flex space-x-2">
                <div key="dot-1" className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div key="dot-2" className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div key="dot-3" className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type='checkbox' className='cursor-pointer' checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}></input>
        </label>
      )}

      {mode === 'document' && file && (
        <div className="text-xs text-center mb-2 text-gray-500 dark:text-gray-400">
          Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="ml-2 text-red-500 hover:text-red-700">Remove</button>
        </div>
      )}

      <form onSubmit={handleSubmit}
        className="bg-white dark:bg-[#141414] rounded-full w-full max-w-2xl p-2 pl-2 mx-auto flex gap-1 items-center border border-gray-200 dark:border-white/10">
        <div className="flex items-center bg-gray-100 dark:bg-[#1a1a1a] rounded-full p-0.5 shrink-0">
          <button type="button" onClick={() => setMode('text')}
            className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'text' ? 'bg-white dark:bg-[#141414] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            Text
          </button>
          <button type="button" onClick={() => setMode('image')}
            className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'image' ? 'bg-white dark:bg-[#141414] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            Image
          </button>
          <button type="button" onClick={() => setMode('document')}
            className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'document' ? 'bg-white dark:bg-[#141414] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            Doc
          </button>
        </div>

        {mode === 'document' ? (
          <>
            <div className="flex flex-1 items-center gap-1">
              <input
                ref={fileInputRef}
                onChange={handleFileChange}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.json,.html,.xml"
                className="max-w-[140px] text-xs outline-none bg-transparent border-0 text-gray-500 dark:text-gray-400 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-300 dark:hover:file:bg-gray-600 cursor-pointer"
              />
              <input onChange={(e) => setInput(e.target.value)}
                value={input}
                type='text'
                placeholder='Ask about the document...'
                className='flex-1 w-full text-sm outline-none bg-transparent border-0 px-2 text-gray-800 dark:text-white placeholder-gray-400'
              />
            </div>
          </>
        ) : (
          <input onChange={(e) => setInput(e.target.value)}
            value={input}
            type='text'
            placeholder='Ask me anything....'
            className='flex-1 w-full text-sm outline-none bg-transparent border-0 px-2 text-gray-800 dark:text-white placeholder-gray-400' required></input>
        )}
        <button disabled={loading} className={`mr-1 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <SendIcon className='w-8 stroke-black dark:stroke-white' stroke='currentColor' strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
