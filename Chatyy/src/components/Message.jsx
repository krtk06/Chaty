import { useEffect, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { Check, Copy, FileText, Sparkles } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { timeAgo } from '../lib/timeAgo'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import User from '../icons/User'
import StreamingText from './chat/StreamingText'

const Message = ({ message, stream = false }) => {
  const { user } = useAppContext()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Prism.highlightAll()
  }, [message.content, stream])

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {message.role === "user" ? (
        <div className='my-4 flex items-start justify-end gap-3'>
          <div className='flex max-w-[85%] flex-col gap-1.5 rounded-2xl rounded-br-md bg-ink p-3.5 px-4 text-paper shadow-[0_12px_32px_-14px_rgba(28,25,23,0.6)] md:max-w-2xl dark:bg-[#f5f1e8] dark:text-coal'>
            {message.isDocument && (
              <span className='flex items-center gap-1.5 text-[11px] font-medium opacity-70'>
                <FileText className='size-3.5 shrink-0' />
                <span className='truncate'>{message.fileName || 'Document'}</span>
              </span>
            )}
            <p className='whitespace-pre-wrap break-words text-[15px] leading-relaxed'>{message.content}</p>
            <span className='text-[11px] opacity-60'>{timeAgo(message.timestamp)}</span>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white dark:border-white/15 dark:bg-white/10" title={user?.name || 'You'}>
            <User className='w-4 not-dark:invert' />
          </span>
        </div>
      ) : (
        <div className='my-4 flex items-start gap-3'>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fc7819] text-black shadow-[0_0_20px_rgba(252,120,25,0.5)]" title="Chatyy">
            <Sparkles className="size-4" />
          </span>
          <div className='group min-w-0 max-w-[88%] flex-1 md:max-w-2xl'>
            <div className='rounded-2xl rounded-tl-md border border-black/10 bg-white/85 p-4 px-5 shadow-[0_12px_32px_-18px_rgba(28,25,23,0.45)] dark:border-white/10 dark:bg-white/[0.04]'>
              {message.isImage ? (
                <figure>
                  <img src={message.content} alt='AI generated artwork' className='mt-1 w-full max-w-md rounded-xl border border-black/10 dark:border-white/10' loading='lazy' />
                  <figcaption className="mt-3 flex items-center gap-3">
                    <a href={message.content} target='_blank' rel='noreferrer' download
                      className='text-xs font-semibold text-[#fc7819] underline-offset-4 hover:underline'>
                      Open full size
                    </a>
                  </figcaption>
                </figure>
              ) : (
                <div className='reset-tw break-words text-[15px] leading-relaxed'>
                  {stream ? (
                    <StreamingText text={message.content} />
                  ) : (
                    <Markdown>{message.content}</Markdown>
                  )}
                </div>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-3 px-1">
              <span className='text-[11px] text-black/45 dark:text-white/40'>{timeAgo(message.timestamp)}</span>
              {!message.isImage && (
                <button onClick={copyText}
                  className='flex cursor-pointer items-center gap-1 text-[11px] font-medium text-black/45 opacity-0 transition-all hover:text-black group-hover:opacity-100 focus:opacity-100 dark:text-white/40 dark:hover:text-white'>
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Motion.div>
  )
}

export default Message
