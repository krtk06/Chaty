import { useState, useEffect, useRef } from 'react'
import { motion as Motion, useReducedMotion } from "motion/react";
import { Coins } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import Message from './Message'
import Composer from './chat/Composer'
import EmptyHero from './chat/EmptyHero'
import ThinkingPulse from './chat/ThinkingPulse'
import toast from 'react-hot-toast'

const starterPrompts = [
  'Explain a complex topic simply',
  'Write a short story opening',
  'Generate an image of a mountain lake at dawn',
  'Help me brainstorm names',
]

const ideaPool = [
  'Explain a complex topic simply',
  'Write a short story opening',
  'Generate an image of a mountain lake at dawn',
  'Help me brainstorm names',
  'Explain quantum computing like I am five',
  'Generate an image of a cozy cabin in the snow',
  'Draft a tagline for a coffee brand',
  'Generate an image of a fox astronaut',
]

const costs = { text: 1, image: 2, document: 2 }
const modes = ['text', 'image', 'document']

function CommandBar({ title, credits, mode, onModeChange }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-cream/80 px-4 py-3 backdrop-blur-md md:px-8 dark:border-white/10 dark:bg-coal/80">
      <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold tabular-nums sm:flex dark:border-white/10 dark:bg-white/[0.05]">
          <Coins className="size-3.5 text-[#fc7819]" />
          {credits ?? 0}
        </span>
        <div className="relative flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.05]" role="tablist" aria-label="Generation mode">
          {modes.map((m) => {
            const selected = mode === m
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onModeChange(m)}
                className={`relative rounded-full px-3 py-1.5 text-[13px] font-semibold capitalize transition-colors sm:px-4 ${selected
                  ? 'text-paper dark:text-coal'
                  : 'text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white'}`}
              >
                {selected && (
                  <Motion.span
                    layoutId="mode-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-ink dark:bg-[#f5f1e8]"
                  />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ThreadView({ containerRef, messages, loading, reduceMotion, onPickStarter }) {
  const hasMessages = messages.length > 0
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role !== 'user' && !messages[i].isImage) return i
    }
    return -1
  })()

  // Empty state fills the whole thread container (full-bleed gradient);
  // message threads use a centred column.
  if (!hasMessages) {
    return (
      <div ref={containerRef} className="relative flex-1 overflow-y-auto">
        <EmptyHero starters={starterPrompts} onPick={onPickStarter} reduceMotion={reduceMotion} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        {messages.map((message, index) => (
          <Message
            key={message._id || index}
            message={message}
            stream={index === lastAssistantIndex}
          />
        ))}

        {loading && <ThinkingPulse reduceMotion={reduceMotion} />}
      </div>
    </div>
  )
}

function NoChatPlaceholder({ reduceMotion }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-cream px-6 dark:bg-coal">
      <Motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 text-center"
      >
        <h2 className="text-3xl font-medium tracking-[-0.04em]">Welcome to <em className="font-editorial italic text-[#fc7819]">Chaty</em></h2>
        <p className="mt-3 text-black/60 dark:text-white/55">
          Select a chat from the sidebar or create a new one to get started
        </p>
      </Motion.div>
    </div>
  )
}

const ChatBox = () => {
  const { selectedChat, user, axios, token, setUser, fetchUsersChats } = useAppContext()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)
  const [documentFile, setDocumentFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [syncedChatId, setSyncedChatId] = useState(selectedChat?._id)
  const containerRef = useRef(null)
  const textareaRef = useRef(null)
  const reduceMotion = useReducedMotion()

  // Seed the thread from the active chat (render-time state adjustment).
  const selectedChatId = selectedChat?._id
  if (selectedChatId !== syncedChatId) {
    setSyncedChatId(selectedChatId)
    setMessages(selectedChat?.messages || [])
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (loading) return
    if (!user) return toast('Login to send message')
    if (!selectedChat) return

    const inputCopy = input
    const trimmed = input.trim()
    if (mode === 'document' && !documentFile) {
      return toast.error('Choose a document first')
    }
    if (mode !== 'document' && !trimmed) return

    setLoading(true)
    setInput('')

    const optimistic = mode === 'document'
      ? { role: 'user', content: trimmed || `Analyze this document: ${documentFile.name}`, timestamp: Date.now(), isImage: false, isDocument: true, fileName: documentFile.name }
      : { role: 'user', content: inputCopy, timestamp: Date.now(), isImage: false }
    setMessages(prev => [...prev, optimistic])

    try {
      let data
      if (mode === 'document') {
        const formData = new FormData()
        formData.append('chatId', selectedChat._id)
        formData.append('prompt', trimmed)
        formData.append('file', documentFile)
        ;({ data } = await axios.post('/api/message/document', formData, { headers: { Authorization: token } }))
      } else {
        ;({ data } = await axios.post(
          `/api/message/${mode}`,
          { chatId: selectedChat._id, prompt: inputCopy, isPublished },
          { headers: { Authorization: token } }
        ))
      }

      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        if (typeof data.credits === 'number') {
          setUser(prev => (prev ? { ...prev, credits: data.credits } : prev))
        } else {
          setUser(prev => (prev ? { ...prev, credits: Math.max(0, (prev.credits ?? 0) - costs[mode]) } : prev))
        }
        if (mode === 'document') setDocumentFile(null)
        // Sync the sidebar and the stored chat with what the server saved.
        await fetchUsersChats()
      } else {
        toast.error(data.message)
        setInput(inputCopy)
        setMessages(prev => prev.filter(m => m !== optimistic))
      }
    } catch (error) {
      toast.error(error.message)
      setInput(inputCopy)
      setMessages(prev => prev.filter(m => m !== optimistic))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (messages.length === 0) return
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }
  }, [messages, reduceMotion])

  const applyStarter = (prompt) => {
    if (prompt.toLowerCase().startsWith('generate an image')) setMode('image')
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const surpriseIdea = () => {
    const pool = ideaPool.filter(p => p !== input)
    applyStarter(pool[Math.floor(Math.random() * pool.length)])
  }

  if (!selectedChat) {
    return <NoChatPlaceholder reduceMotion={reduceMotion} />
  }

  const title = messages.length > 0
    ? selectedChat.messages[0]?.content?.slice(0, 48) || 'New conversation'
    : 'New conversation'

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-cream max-md:mt-14 dark:bg-coal">
      <CommandBar title={title} credits={user?.credits} mode={mode} onModeChange={setMode} />

      <ThreadView
        containerRef={containerRef}
        messages={messages}
        loading={loading}
        reduceMotion={reduceMotion}
        onPickStarter={applyStarter}
      />

      {/* Composer dock */}
      <div className="border-t border-black/10 bg-cream/80 backdrop-blur-md dark:border-white/10 dark:bg-coal/80">
        <div className="mx-auto max-w-3xl px-4 py-4 md:px-8">
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            loading={loading}
            mode={mode}
            onModeChange={setMode}
            isPublished={isPublished}
            onPublishedChange={setIsPublished}
            documentFile={documentFile}
            onDocumentFileChange={setDocumentFile}
            onIdea={surpriseIdea}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatBox
