import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { nav, site } from '@/data/site'
import { Logo } from './Logo'
import { WhatsAppIcon } from './WhatsApp'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? 'bg-paper/95 backdrop-blur-sm border-b border-line' : 'bg-paper border-b border-transparent'
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-ink focus:text-paper focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.95rem]">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-ink-soft hover:text-ink transition-colors"
                  activeProps={{ className: 'text-ink font-medium', 'aria-current': 'page' }}
                  activeOptions={{ exact: item.to === '/' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/enquiry" className="btn btn-primary hidden sm:inline-flex !min-h-[2.6rem] !px-5 text-sm">
            Request a Proposal
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center -mr-2"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6" aria-hidden="true">
              <span className={`absolute left-0 h-[1.5px] w-6 bg-ink transition-transform duration-200 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-[1.5px] w-6 bg-ink transition-transform duration-200 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="lg:hidden fixed inset-x-0 top-[4.5rem] bottom-0 bg-paper border-t border-line overflow-y-auto"
      >
        <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pt-6 pb-10">
          <ul className="divide-y divide-line border-y border-line">
            {nav.map((item, i) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-baseline justify-between py-5 text-3xl display"
                  activeOptions={{ exact: item.to === '/' }}
                  activeProps={{ className: 'text-forest', 'aria-current': 'page' }}
                >
                  {item.label}
                  <span className="text-xs text-muted tracking-normal">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/enquiry" className="btn btn-primary mt-8 justify-center">
            Request a Proposal
          </Link>
          <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-3 justify-center">
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
