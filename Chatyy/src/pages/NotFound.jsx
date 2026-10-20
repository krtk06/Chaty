import { ArrowLeft, Compass, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'

const quickLinks = [
  { to: '/', label: 'Start a chat', icon: MessageSquare },
  { to: '/community', label: 'Community images', icon: ImageIcon },
  { to: '/credits', label: 'Credit plans', icon: Compass },
]

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-cream text-ink antialiased dark:bg-coal dark:text-[#f5f1e8]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-black/55 transition-colors hover:text-black dark:text-white/55 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to Chaty
          </Link>
          <span className="text-ink dark:text-[#f5f1e8]">
            <LogoWordmark />
          </span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="font-editorial text-[92px] leading-none tracking-[-0.05em] text-black/85 italic dark:text-white/90">
            404
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-black sm:text-4xl dark:text-white">
            This page wandered off
          </h1>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-black/60 dark:text-white/60">
            The link you followed does not exist, or the page has moved. Try one of these instead.
          </p>

          <div className="mt-9 grid w-full max-w-md gap-2.5 sm:grid-cols-1">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3 rounded-xl border border-black/10 bg-white/70 p-3.5 text-left transition-colors hover:border-[#fc7819]/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#fc7819]/60 dark:hover:bg-white/[0.07]"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fc7819]/15 text-[#c85a0c] transition-colors group-hover:bg-[#fc7819] group-hover:text-white dark:text-[#fc7819] dark:group-hover:text-black">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[15px] font-medium text-black/80 group-hover:text-black dark:text-white/80 dark:group-hover:text-white">
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>

          <nav className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              to="/terms"
              className="text-black/50 underline decoration-[#fc7819] decoration-2 underline-offset-4 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              to="/privacy"
              className="text-black/50 underline decoration-[#fc7819] decoration-2 underline-offset-4 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
          </nav>
        </main>

        <footer className="border-t border-black/10 pt-5 text-center text-xs text-black/40 dark:border-white/10 dark:text-white/40">
          Chaty &middot; AI chat and image generation
        </footer>
      </div>
    </div>
  )
}
