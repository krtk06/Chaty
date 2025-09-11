import React, { useState, useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import Message from './Message'
import { assets } from '../assets/assets'
import SendIcon from '../icons/SendIcon'

const ChatBox = () => {
  const { selectedChat, user, chats, setChats, setSelectedChat } = useAppContext()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages,setMessages] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    if(selectedChat){
      sendMessage(selectedChat.messages)
    }
  },[selectedChat])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }  

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  },[messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessage = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    const updatedChat = {
      ...selectedChat,
      messages: [...(selectedChat?.messages || []), newMessage]
    }

    setSelectedChat(updatedChat)
    setInput('')
    setLoading(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10  max-md:mt-14 2xl:pr-40  ">
      <div ref = {containerRef}
      className="flex-1 overflow-y-scroll mb-5">
        {selectedChat.messages && selectedChat.messages.length > 0 ? (
          selectedChat.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Ask me anything</h3>
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
        <label className = 'inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type='checkbox' className='cursor-pointer' checked = {isPublic}
                 onChange={(e)=>setIsPublic(e.target.checked)}></input>
        </label>
      )}
      <form onClick={handleSubmit}
      className="bg-primary/20 dark:bg-[#202020]/30 border border-primary dark:border-[#313131]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center">
          <select onChange={(e) => setMode(e.target.value)} value={mode}
          className='text-sm pl-3 pr-2 outline-none'>
            <option className='dark:bg-[#404040]' value='text'>Text</option>
            <option className='dark:bg-[#404040]' value='image'>Image</option>
          </select>
          <input onChange={(e) => setInput(e.target.value)} 
                 value={input} 
                 type='text' 
                 placeholder='Ask me anything....'
                 className='flex-1 w-full text-sm outline-none' required></input>
                 <button disabled={loading}>
                  <SendIcon className='w-8 cursor-pointer'/>
                 </button>
      </form>
    </div>
  )
}

export default ChatBox
