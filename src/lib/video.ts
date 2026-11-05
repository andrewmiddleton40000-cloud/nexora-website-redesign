/** Converts common share links to embeddable players; anything else returns null and is shown as a link. */
export function embedUrl(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}`
    if (u.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed${u.pathname}`
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
    }
    if (u.hostname === 'drive.google.com' && u.pathname.includes('/file/d/')) return url.replace(/\/view.*$/, '/preview')
  } catch {
    /* ignore */
  }
  return null
}
