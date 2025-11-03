import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
  const navigate = useNavigate()
  const {fetchUser} = useAppContext()

  useEffect(()=> {
    const timeout =  setTimeout(()=>{
      fetchUser()
      navigate('/')
    },8000)
    return ()=> clearTimeout(timeout)
  },[])
  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center h-screen w-screen">
      <div className="text-center">
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-4 h-4 bg-[#0e5fd4]/60 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-[#0e5fd4]/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-4 h-4 bg-[#0e5fd4]/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          Loading
        </h2>
        <p className="text-gray-400">
          Please wait a while...
        </p>
      </div>
    </div>
  )
}

export default Loading
