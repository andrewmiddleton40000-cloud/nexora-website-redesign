import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

/**
 * Fades each top-level section below the first screen in as it scrolls into view.
 * Content stays visible without JS, and the CSS skips the effect for reduced motion.
 */
export function Reveal() {
  const pathname = useRouterState({ select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname })
  useEffect(() => {
    const main = document.getElementById('main')
    if (!main || !('IntersectionObserver' in window)) return
    document.documentElement.classList.add('reveal-ready')
    const sections = Array.from(main.querySelectorAll<HTMLElement>(':scope > section')).slice(1)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )
    for (const s of sections) {
      // Anything already on screen (e.g. after a hash jump) shows immediately.
      const r = s.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) continue
      s.classList.add('reveal')
      io.observe(s)
    }
    return () => io.disconnect()
  }, [pathname])
  return null
}
