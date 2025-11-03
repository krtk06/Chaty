import React, { useEffect } from 'react'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import User from '../icons/User'
import AiIcon from '../icons/AiIcon'

const Message = ({ message }) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])
  return (
    <div>
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-3 p-3 px-4 border border-blue-100 dark:border-white/10 rounded-2xl max-w-2xl break-words bg-white dark:bg-[#141414]'>
            {message.isDocument ? (
              <div className='flex items-center gap-2 text-sm dark:text-white'>
                <svg className='w-5 h-5 shrink-0 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' />
                </svg>
                <span className='font-medium truncate'>{message.fileName}</span>
              </div>
            ) : null}
            <p className='text-sm dark:text-white'>{message.content}</p>
            <span className='text-xs text-gray-400 dark:text-gray-500'>{moment(message.timestamp).fromNow()}</span>
          </div>
          <div className='shrink-0'>
            <User className='w-7 not-dark:invert' />
          </div>
        </div>
      )
        :
        (
          <div className='inline-flex items-start gap-2 my-4 max-w-2xl'>
            <div className='shrink-0 mt-1'>
              <AiIcon className='w-7 not-dark:invert' />
            </div>
            <div className='flex flex-col gap-2 p-3 px-4 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#141414]'>
              {message.isImage ? (
                <img src={message.content} alt='' className='w-full max-w-md mt-2 rounded-md'></img>
              ) : (
                <div className='text-sm dark:text-white reset-tw break-words'>
                  <Markdown>{message.content}</Markdown>
                </div>
              )}
              <span className='text-xs text-gray-400 dark:text-gray-500'>{moment(message.timestamp).fromNow()}</span>
            </div>
          </div>
        )}
    </div>
  )
}

export default Message
