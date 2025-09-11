import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Loading = () => {
  const navigate = useNavigate()

  useEffect(()=> {
    const timeout =  setTimeout(()=>{
      navigate('/')
    },8000)
    return ()=> clearTimeout(timeout)
  },[])
  return (
    <div className="bg-gradient-to-b from-[#531B81] to-[#29184B] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl">
      <div className="text-center">
        <img 
          src={assets.logo_full} 
          alt="QuickGPT" 
          className="h-16 mx-auto mb-8 animate-pulse"
        />
        
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Loading QuickGPT
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we prepare your AI assistant...
        </p>
      </div>
    </div>
  )
}

export default Loading
