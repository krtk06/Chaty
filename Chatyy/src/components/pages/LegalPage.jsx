import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoWordmark } from '../Logo'
import { cn } from '../../lib/utils'

/**
 * Renders a legal document (terms, privacy) with the Chaty visual language:
 * cream/ink light theme, coal/white dark theme, orange used as a small accent.
 */
export default function LegalPage({ doc, updated, companyName, contactEmail, siblings = [] }) {
  return (
    <div className="min-h-screen w-full bg-cream text-ink antialiased dark:bg-coal dark:text-[#f5f1e8]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 sm:px-8">
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

        <main className="flex-1 pt-10 pb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#c85a0c] uppercase dark:text-[#fc7819]">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-black sm:text-5xl dark:text-white">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-black/45 dark:text-white/45">
            Last updated: {updated} &middot; {companyName}
          </p>

          <p className="mt-8 border-l-2 border-[#fc7819] pl-4 text-[15px] leading-relaxed text-black/70 dark:text-white/70">
            {doc.intro}
          </p>

          <div className="mt-10 space-y-9">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-black dark:text-white">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-[15px] leading-relaxed text-black/70 dark:text-white/70"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.paragraph2 && (
                  <p className="mt-3 text-[15px] leading-relaxed text-black/70 dark:text-white/70">
                    {section.paragraph2}
                  </p>
                )}

                {section.list && (
                  <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-black/70 dark:text-white/70">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-[#fc7819]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm font-medium text-black dark:text-white">Contact</p>
            <p className="mt-1.5 text-sm text-black/65 dark:text-white/65">
              Questions about this document? Write to{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-[#c85a0c] underline underline-offset-2 dark:text-[#fc7819]"
              >
                {contactEmail}
              </a>
              .
            </p>
          </div>

          {siblings.length > 0 && (
            <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {siblings.map((sibling) => (
                <Link
                  key={sibling.to}
                  to={sibling.to}
                  className={cn(
                    'text-black/55 underline underline-offset-4 transition-colors hover:text-black dark:text-white/55 dark:hover:text-white',
                    'decoration-[#fc7819] decoration-2'
                  )}
                >
                  {sibling.label}
                </Link>
              ))}
            </nav>
          )}
        </main>

        <footer className="border-t border-black/10 pt-5 text-xs text-black/40 dark:border-white/10 dark:text-white/40">
          {companyName} &middot; AI chat and image generation
        </footer>
      </div>
    </div>
  )
}
