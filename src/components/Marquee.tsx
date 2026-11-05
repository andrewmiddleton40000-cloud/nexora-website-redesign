import type { ReactNode } from 'react'

/** A slow scrolling band of short phrases. Static when the visitor prefers reduced motion. */
export function Marquee({ items, tone = 'ink' }: { items: ReactNode[]; tone?: 'ink' | 'signal' }) {
  const row = (hidden: boolean) => (
    <ul className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span className="display text-3xl md:text-5xl">{it}</span>
          <span
            className={`inline-block h-3 w-3 rotate-45 ${tone === 'ink' ? 'bg-signal' : 'bg-forest'}`}
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  )
  return (
    <div className={`${tone === 'ink' ? 'bg-ink text-paper' : 'bg-signal text-ink'} py-7 md:py-9`}>
      <div className="marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
