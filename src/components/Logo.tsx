import { Link } from '@tanstack/react-router'

/** Typographic wordmark: a split "N" mark plus the company name. */
export function Logo({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  const color = tone === 'ink' ? 'text-ink' : 'text-paper'
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${color}`} aria-label="Nexora Technologies — home">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="7" fill="currentColor" />
        <path d="M10 22V10l12 12V10" stroke={tone === 'ink' ? '#f3efe6' : '#161513'} strokeWidth="2.6" fill="none" strokeLinecap="square" />
        <circle cx="22" cy="10" r="2.2" fill="#c8e05a" />
      </svg>
      <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">
        Nexora<span className="font-normal opacity-60"> Technologies</span>
      </span>
    </Link>
  )
}
