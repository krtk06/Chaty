import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import User from '../icons/User'

const Message = ({ message }) => {
  const { user } = useAppContext()

  useEffect(() => {
    Prism.highlightAll()
  },[message.content])
  return (
    <div>
      {message.role ==="user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-3 p-2 px-4 bg-slate-50 dark:bg-[#303030]/30 border border-[#212121]/30 rounded-md max-w-2xl'>
              <p className='text-sm dark:text-white'>{message.content}</p>
              <span className='text-xs text-gray-400 dark:text-[#313131]'>{moment(message.timestamp).fromNow()}</span>
          </div>
          <User className='w-6 not-dark:invert'/>
        </div>
      )
      :
      (
        <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#303030]/30 border border-[#212121]/30 rounded-md my-4'>
          {message.isImage ? (
            <img src={message.content} alt=' ' className='w-full max-w-md mt-2 rounded-md'></img>
          ):(
            <div className='te-sm dark:text-white reset-tw'>
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className='text-xs text-gray-400 dark:text-[#313131]'>{moment(message.timestamp).fromNow()}</span>
        </div>
      )}
    </div>
  )
}

export default Message
