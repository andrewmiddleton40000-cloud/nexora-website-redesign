// Client-safe blog helpers shared by the public pages and the admin editor.

/** Topics suggested in the editor. Authors can type a new one at any time. */
export const SUGGESTED_TOPICS = ['Website development', 'AI automation', 'Business technology', 'Digital growth', 'Digital skills']

export const POSTS_PER_PAGE = 12

export type PostState = 'draft' | 'scheduled' | 'published'

export function postState(p: { status: string; publishedAt: string | null }, now = Date.now()): PostState {
  if (p.status !== 'published' || !p.publishedAt) return 'draft'
  return new Date(p.publishedAt).getTime() > now ? 'scheduled' : 'published'
}

// Nexora is in Lagos, so dates are shown in West Africa Time.
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' })
const dateTimeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' })

export const formatPostDate = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : '')
export const formatPostDateTime = (iso: string | null) => (iso ? `${dateTimeFmt.format(new Date(iso))} WAT` : '')

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
