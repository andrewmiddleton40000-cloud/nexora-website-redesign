// A small, safe Markdown renderer for blog posts. It builds React elements directly
// (never raw HTML), so nothing an author types can inject scripts or styles.
//
// Supported: ## and ### headings, paragraphs, - bullet and 1. numbered lists, > quotes,
// --- dividers, ![alt](image) on its own line, a YouTube link on its own line (embedded),
// and inline **bold**, *italic*, `code` and [links](https://…).
import type { ReactNode } from 'react'
import { img } from '@/data/site'

export type MdBlock =
  | { type: 'h2' | 'h3'; text: string; id: string }
  | { type: 'p' | 'quote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'hr' }
  | { type: 'image'; src: string; alt: string }
  | { type: 'youtube'; id: string }

export function slugifyHeading(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[*_`[\]()]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'section'
  )
}

const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/

export function youtubeId(line: string): string | null {
  const m = line.trim().match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#][^\s]*)?$/)
  return m ? m[1] : null
}

export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const blocks: MdBlock[] = []
  const ids = new Map<string, number>()
  const uniqueId = (text: string) => {
    const base = slugifyHeading(text)
    const n = ids.get(base) ?? 0
    ids.set(base, n + 1)
    return n ? `${base}-${n + 1}` : base
  }
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i++
      continue
    }
    let m: RegExpMatchArray | null
    if ((m = line.match(/^(#{2,3})\s+(.+)$/))) {
      const text = m[2].replace(/#+$/, '').trim()
      blocks.push({ type: m[1].length === 2 ? 'h2' : 'h3', text, id: uniqueId(text) })
      i++
    } else if (/^#\s+/.test(line)) {
      // A single # is treated as a section heading: the post title is the page's only h1.
      const text = line.replace(/^#\s+/, '')
      blocks.push({ type: 'h2', text, id: uniqueId(text) })
      i++
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      blocks.push({ type: 'hr' })
      i++
    } else if ((m = line.match(IMAGE_LINE))) {
      blocks.push({ type: 'image', alt: m[1], src: m[2] })
      i++
    } else if (youtubeId(line)) {
      blocks.push({ type: 'youtube', id: youtubeId(line)! })
      i++
    } else if (/^[-*+]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const ordered = /^\d/.test(line)
      const re = ordered ? /^\d+[.)]\s+/ : /^[-*+]\s+/
      const items: string[] = []
      while (i < lines.length && re.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(re, ''))
        i++
        // Indented or wrapped continuation lines join the previous item.
        while (i < lines.length && lines[i].trim() && !re.test(lines[i].trim()) && /^\s+/.test(lines[i])) {
          items[items.length - 1] += ' ' + lines[i].trim()
          i++
        }
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items })
    } else if (line.startsWith('>')) {
      const parts: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        parts.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'quote', text: parts.join(' ') })
    } else {
      const parts: string[] = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (!l || /^#{1,3}\s/.test(l) || /^[-*+]\s+/.test(l) || /^\d+[.)]\s+/.test(l) || l.startsWith('>') || /^(-{3,}|\*{3,})$/.test(l) || IMAGE_LINE.test(l)) break
        parts.push(l)
        i++
      }
      blocks.push({ type: 'p', text: parts.join(' ') })
    }
  }
  return blocks
}

/** Only allow safe link targets. */
export function safeHref(url: string): string | null {
  const u = url.trim()
  if (/^(https?:\/\/|mailto:|tel:)/i.test(u)) return u
  if (u.startsWith('/') && !u.startsWith('//')) return u
  if (u.startsWith('#')) return u
  return null
}

/** Resolves an image reference: an uploaded file, a site photo (e.g. office.jpg) or an https URL. */
export function imageSrc(ref: string, width = 1400): string | null {
  const r = ref.trim()
  if (/^\/api\/blog\/media\/[A-Za-z0-9._-]+$/.test(r)) return r
  if (/^[a-z0-9/_-]+\.(jpe?g|png|webp)$/i.test(r) && !r.startsWith('/')) return img(r, width)
  if (/^https:\/\//i.test(r)) return r
  return null
}

const INLINE = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  let k = 0
  while (rest) {
    const m = rest.match(INLINE)
    if (!m || m.index === undefined) {
      out.push(rest)
      break
    }
    if (m.index > 0) out.push(rest.slice(0, m.index))
    const key = `${keyPrefix}-${k++}`
    if (m[2] ?? m[3]) out.push(<strong key={key}>{renderInline(m[2] ?? m[3], key)}</strong>)
    else if (m[4] ?? m[5]) out.push(<em key={key}>{renderInline(m[4] ?? m[5], key)}</em>)
    else if (m[6]) out.push(<code key={key}>{m[6]}</code>)
    else if (m[7]) {
      const href = safeHref(m[8])
      if (!href) out.push(m[7])
      else {
        const external = /^https?:\/\//i.test(href)
        out.push(
          <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {renderInline(m[7], key)}
          </a>,
        )
      }
    }
    rest = rest.slice(m.index + m[0].length)
  }
  return out
}

/** Plain text without Markdown symbols, for search snippets and reading time. */
export function plainText(src: string) {
  return src
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function readingMinutes(src: string) {
  const words = plainText(src).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source)
  return (
    <>
      {blocks.map((b, i) => {
        const k = `b${i}`
        switch (b.type) {
          case 'h2':
            return <h2 key={k} id={b.id}>{renderInline(b.text, k)}</h2>
          case 'h3':
            return <h3 key={k} id={b.id}>{renderInline(b.text, k)}</h3>
          case 'p':
            return <p key={k}>{renderInline(b.text, k)}</p>
          case 'quote':
            return <blockquote key={k}><p>{renderInline(b.text, k)}</p></blockquote>
          case 'ul':
            return <ul key={k}>{b.items.map((t, j) => <li key={j}>{renderInline(t, `${k}-${j}`)}</li>)}</ul>
          case 'ol':
            return <ol key={k}>{b.items.map((t, j) => <li key={j}>{renderInline(t, `${k}-${j}`)}</li>)}</ol>
          case 'hr':
            return <hr key={k} />
          case 'image': {
            const src = imageSrc(b.src)
            if (!src) return null
            return (
              <figure key={k}>
                <img src={src} alt={b.alt} loading="lazy" decoding="async" />
              </figure>
            )
          }
          case 'youtube':
            return (
              <div key={k} className="video-embed">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${b.id}`}
                  title="YouTube video"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )
        }
      })}
    </>
  )
}

/** Headings for an in-page table of contents. */
export function outline(source: string) {
  return parseMarkdown(source).filter((b): b is { type: 'h2'; text: string; id: string } => b.type === 'h2')
}
