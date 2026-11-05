import { useMemo, useRef, useState } from 'react'
import { adminGetPost, adminListPosts, deletePost, savePost } from '@/server/fns/blog'
import { categories } from '@/data/pricing'
import { SUGGESTED_TOPICS, formatPostDateTime, postState, slugify, type PostState } from '@/lib/blog'
import { Markdown, imageSrc, readingMinutes } from '@/lib/markdown'
import { Alert, Badge, useAction } from '../ui'
import { L, Loading, Panel, input, smallBtn, smallPrimary, useServerData } from './shared'

type List = Awaited<ReturnType<typeof adminListPosts>>
type Full = Awaited<ReturnType<typeof adminGetPost>>

const stateTone: Record<PostState, string> = { draft: 'locked', scheduled: 'pending', published: 'success' }
const stateLabel: Record<PostState, string> = { draft: 'Draft', scheduled: 'Scheduled', published: 'Published' }

// Nexora works in West Africa Time (UTC+1, no daylight saving).
const WAT_MS = 60 * 60 * 1000
const toWatInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + WAT_MS).toISOString().slice(0, 16) : '')
const fromWatInput = (v: string) => (v ? new Date(`${v}:00+01:00`).toISOString() : null)
const watDay = (iso: string) => new Date(new Date(iso).getTime() + WAT_MS).toISOString().slice(0, 10)

export function Blog() {
  const { data, error, loading, reload } = useServerData(() => adminListPosts())
  const [sel, setSel] = useState<number | 'new' | null>(null)
  const [filter, setFilter] = useState<PostState | 'all'>('all')
  const posts = data?.posts ?? []
  const shown = filter === 'all' ? posts : posts.filter((p) => postState(p) === filter)

  return (
    <div className="space-y-12">
      {data && <Schedule posts={posts} />}
      <div className="grid gap-10 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <Panel title="Posts" actions={<button className={smallPrimary} onClick={() => setSel('new')}>New post</button>}>
            <div className="mb-4 flex flex-wrap gap-2 text-xs" role="group" aria-label="Filter posts">
              {(['all', 'draft', 'scheduled', 'published'] as const).map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 ${filter === f ? 'border-forest bg-forest text-paper' : 'border-line bg-white'}`}>
                  {f === 'all' ? `All (${posts.length})` : `${stateLabel[f]} (${posts.filter((p) => postState(p) === f).length})`}
                </button>
              ))}
            </div>
            <Loading error={error} loading={loading && !data} />
            <ul className="divide-y divide-line">
              {shown.map((p) => {
                const st = postState(p)
                return (
                  <li key={p.id}>
                    <button className={`flex w-full items-start justify-between gap-3 py-3 text-left ${sel === p.id ? 'text-forest' : ''}`} onClick={() => setSel(p.id)}>
                      <span>
                        <span className="font-medium">{p.title}</span>
                        <br />
                        <span className="text-xs text-muted">
                          {st === 'draft' ? `Edited ${formatPostDateTime(p.updatedAt)}` : formatPostDateTime(p.publishedAt)}
                          {p.editor ? ` · ${p.editor}` : ''}
                        </span>
                      </span>
                      <Badge tone={stateTone[st]}>{stateLabel[st]}</Badge>
                    </button>
                  </li>
                )
              })}
              {data && !shown.length && <li className="py-3 text-sm text-muted">No posts here yet.</li>}
            </ul>
          </Panel>
        </div>
        <div className="xl:col-span-8">
          {sel === 'new' && <Editor key="new" post={null} lists={data} onSaved={(id) => { reload(); setSel(id) }} onDeleted={() => {}} />}
          {typeof sel === 'number' && <LoadEditor key={sel} id={sel} lists={data} onSaved={() => reload()} onDeleted={() => { setSel(null); reload() }} />}
          {!sel && (
            <div className="border-t border-ink pt-5 text-sm leading-relaxed text-muted">
              <p>Choose a post to edit, or start a new one.</p>
              <p className="mt-3">Posts go live on the Blog at the date and time you choose. To post every day, write a few ahead and schedule them, then check the week view above for any gaps.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** The next seven days, so gaps in a daily schedule are easy to spot. */
function Schedule({ posts }: { posts: List['posts'] }) {
  const days = useMemo(() => {
    const now = Date.now()
    return Array.from({ length: 7 }, (_, i) => {
      const iso = new Date(now + i * 86_400_000).toISOString()
      const key = watDay(iso)
      const items = posts.filter((p) => p.status === 'published' && p.publishedAt && watDay(p.publishedAt) === key)
      return { key, label: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' }).format(new Date(iso)), items, today: i === 0 }
    })
  }, [posts])
  return (
    <Panel title="This week">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((d) => (
          <li key={d.key} className={`rounded-xl border p-3 text-sm ${d.items.length ? 'border-forest/40 bg-forest-tint/50' : 'border-dashed border-line bg-white'}`}>
            <p className="text-xs uppercase tracking-[0.1em] text-muted">{d.today ? 'Today' : d.label}</p>
            {d.items.length ? (
              <ul className="mt-2 space-y-1">
                {d.items.map((p) => <li key={p.id} className="line-clamp-2 text-xs font-medium">{p.title}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted">Nothing scheduled</p>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  )
}

function LoadEditor({ id, lists, onSaved, onDeleted }: { id: number; lists: List | null; onSaved: (id: number) => void; onDeleted: () => void }) {
  const { data, error, loading } = useServerData(() => adminGetPost({ data: { id } }), [id])
  if (!data) return <Loading error={error} loading={loading} />
  return <Editor post={data} lists={lists} onSaved={onSaved} onDeleted={onDeleted} />
}

async function upload(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/blog/upload', { method: 'POST', body, credentials: 'same-origin' })
  const json = (await res.json().catch(() => ({}))) as { path?: string; error?: string }
  if (!res.ok || !json.path) throw new Error(json.error ?? 'The image could not be uploaded.')
  return json.path
}

function Editor({ post, lists, onSaved, onDeleted }: { post: Full | null; lists: List | null; onSaved: (id: number) => void; onDeleted: () => void }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!post)
  const [summary, setSummary] = useState(post?.summary ?? '')
  const [topic, setTopic] = useState(post?.topic ?? '')
  const [authorName, setAuthorName] = useState(post?.authorName ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '')
  const [coverAlt, setCoverAlt] = useState(post?.coverAlt ?? '')
  const [relatedService, setRelatedService] = useState(post?.relatedService ?? '')
  const [relatedCourseSlug, setRelatedCourseSlug] = useState(post?.relatedCourseSlug ?? '')
  const [when, setWhen] = useState(toWatInput(post?.publishedAt ?? null))
  const [version, setVersion] = useState(post?.updatedAt)
  const [liveAt, setLiveAt] = useState(post?.publishedAt ?? null)
  const [current, setCurrent] = useState(post ? postState(post) : 'draft')
  const [id, setId] = useState(post?.id)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [notice, setNotice] = useState<string | null>(null)
  const { pending, error, setError, run } = useAction()
  const area = useRef<HTMLTextAreaElement>(null)
  const effectiveSlug = slugTouched ? slugify(slug) : slugify(title)
  const topics = [...new Set([...SUGGESTED_TOPICS, ...(lists?.topics ?? [])])]

  function insert(before: string, after = '', placeholder = '') {
    const el = area.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const chosen = body.slice(s, e) || placeholder
    const next = body.slice(0, s) + before + chosen + after + body.slice(e)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, s + before.length + chosen.length)
    })
  }
  const block = (text: string) => {
    const el = area.current
    const pos = el?.selectionStart ?? body.length
    const pre = body.slice(0, pos)
    const lead = pre && !pre.endsWith('\n\n') ? (pre.endsWith('\n') ? '\n' : '\n\n') : ''
    setBody(pre + lead + text + '\n\n' + body.slice(pos))
  }

  async function save(mode: 'draft' | 'publish' | 'schedule' | 'unpublish') {
    setNotice(null)
    let publishedAt: string | null = fromWatInput(when)
    if (mode === 'publish') publishedAt = current === 'published' && liveAt ? liveAt : new Date().toISOString()
    if (mode === 'schedule') {
      if (!publishedAt) return setError('Choose the date and time the post should go live.')
      if (new Date(publishedAt).getTime() <= Date.now()) return setError('Choose a time in the future to schedule, or use Publish now.')
    }
    if (mode === 'draft' || mode === 'unpublish') publishedAt = null
    const status = mode === 'publish' || mode === 'schedule' ? 'published' : 'draft'
    const row = await run(() =>
      savePost({
        data: {
          id,
          title,
          slug: effectiveSlug,
          summary,
          topic,
          body,
          coverImage: coverImage || undefined,
          coverAlt: coverAlt || undefined,
          authorName: authorName || undefined,
          relatedService: relatedService || undefined,
          relatedCourseSlug: relatedCourseSlug || undefined,
          status,
          publishedAt,
          expectedUpdatedAt: version ?? undefined,
        },
      }),
    )
    if (!row) return
    setId(row.id)
    setVersion(row.updatedAt)
    setSlug(row.slug)
    setSlugTouched(true)
    setWhen(toWatInput(row.publishedAt))
    setLiveAt(row.publishedAt)
    const st = postState(row)
    setCurrent(st)
    setNotice(st === 'published' ? 'Published. The post is live on the Blog.' : st === 'scheduled' ? `Scheduled for ${formatPostDateTime(row.publishedAt)}.` : 'Draft saved. It is not visible to the public.')
    onSaved(row.id)
  }

  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const coverPreview = coverImage ? imageSrc(coverImage, 800) : null

  return (
    <Panel
      title={post ? 'Edit post' : 'New post'}
      actions={
        <div className="flex items-center gap-3">
          <Badge tone={stateTone[current]}>{stateLabel[current]}</Badge>
          {current === 'published' && <a className="text-xs underline" href={`/blog/${effectiveSlug}`} target="_blank" rel="noopener">View live</a>}
        </div>
      }
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(current === 'draft' ? 'draft' : current === 'scheduled' ? 'schedule' : 'publish') }}>
        <L label="Title" className="md:col-span-2"><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} /></L>
        <L label="Web address" className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">/blog/</span>
            <input className={input} value={effectiveSlug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }} maxLength={100} />
          </div>
          {current === 'published' && <span className="mt-1 block normal-case tracking-normal">Changing the address of a live post breaks links people have already shared.</span>}
        </L>
        <L label={`Summary (${summary.length}/400)`} className="md:col-span-2">
          <textarea className={input} rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={400} />
          <span className="mt-1 block normal-case tracking-normal">Shown in listings, on Google and when the post is shared. One or two sentences.</span>
        </L>
        <L label="Topic">
          <input className={input} list="blog-topics" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={60} />
          <datalist id="blog-topics">{topics.map((t) => <option key={t} value={t} />)}</datalist>
        </L>
        <L label="Author name (optional)"><input className={input} value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={80} placeholder="Leave blank to credit Nexora" /></L>

        <div className="md:col-span-2 grid gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-[8rem_1fr]">
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-paper-deep">
            {coverPreview && <img src={coverPreview} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.1em] text-muted">Cover image (optional)</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`${smallBtn} cursor-pointer`}>
                Upload image
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) { const path = await run(() => upload(f)); if (path) setCoverImage(path) }
                }} />
              </label>
              {coverImage && <button type="button" className="text-xs underline" onClick={() => { setCoverImage(''); setCoverAlt('') }}>Remove</button>}
            </div>
            <input className={input} value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} maxLength={200} placeholder="Describe the image for people who can’t see it" aria-label="Cover image description" />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-line bg-paper-deep/40 px-2 py-1.5">
            <div role="tablist" className="flex gap-1 text-xs">
              {(['write', 'preview'] as const).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded px-3 py-1 ${tab === t ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>{t === 'write' ? 'Write' : 'Preview'}</button>
              ))}
            </div>
            {tab === 'write' && (
              <div className="flex flex-wrap gap-1 text-xs" aria-label="Formatting">
                <button type="button" className="rounded px-2 py-1 hover:bg-white" onClick={() => block('## Heading')}>Heading</button>
                <button type="button" className="rounded px-2 py-1 font-bold hover:bg-white" onClick={() => insert('**', '**', 'bold text')}>B</button>
                <button type="button" className="rounded px-2 py-1 italic hover:bg-white" onClick={() => insert('*', '*', 'italic text')}>I</button>
                <button type="button" className="rounded px-2 py-1 hover:bg-white" onClick={() => { const url = prompt('Link address (https://… or /services)'); if (url) insert('[', `](${url})`, 'link text') }}>Link</button>
                <button type="button" className="rounded px-2 py-1 hover:bg-white" onClick={() => block('- First point\n- Second point')}>List</button>
                <button type="button" className="rounded px-2 py-1 hover:bg-white" onClick={() => block('> A quote or key takeaway')}>Quote</button>
                <label className="cursor-pointer rounded px-2 py-1 hover:bg-white">
                  Image
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={async (e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    if (!f) return
                    const path = await run(() => upload(f))
                    if (path) block(`![${prompt('Describe the image for people who can’t see it') ?? ''}](${path})`)
                  }} />
                </label>
                <button type="button" className="rounded px-2 py-1 hover:bg-white" onClick={() => { const url = prompt('YouTube video link'); if (url) block(url.trim()) }}>YouTube</button>
              </div>
            )}
          </div>
          {tab === 'write' ? (
            <textarea ref={area} className={`${input} min-h-[28rem] font-mono !text-[0.9rem] leading-relaxed`} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Post body" />
          ) : (
            <div className="prose-article min-h-[28rem] border border-line bg-white p-6">{body.trim() ? <Markdown source={body} /> : <p className="text-muted">Nothing to preview yet.</p>}</div>
          )}
          <p className="mt-2 text-xs text-muted">
            {words} words · about {readingMinutes(body)} min read. Start a line with ## for a heading, - for a bullet or &gt; for a quote. Put a YouTube link on its own line to embed the video.
          </p>
        </div>

        <L label="Related service (shown at the end)">
          <select className={input} value={relatedService} onChange={(e) => setRelatedService(e.target.value)}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </L>
        <L label="Related Academy course">
          <select className={input} value={relatedCourseSlug} onChange={(e) => setRelatedCourseSlug(e.target.value)}>
            <option value="">None</option>
            {lists?.courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
        </L>

        <div className="md:col-span-2 space-y-4 border-t border-line pt-5">
          <L label="Publish date and time (West Africa Time)">
            <input type="datetime-local" className={`${input} max-w-xs`} value={when} onChange={(e) => setWhen(e.target.value)} />
            <span className="mt-1 block normal-case tracking-normal">Pick a future time and press Schedule. The post goes live automatically at that time.</span>
          </L>
          {error && <Alert>{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}
          <div className="flex flex-wrap gap-2">
            {current === 'draft' ? (
              <>
                <button type="button" className={smallBtn} disabled={pending} onClick={() => save('draft')}>Save draft</button>
                <button type="button" className={smallBtn} disabled={pending} onClick={() => save('schedule')}>Schedule</button>
                <button type="button" className={smallPrimary} disabled={pending} onClick={() => save('publish')}>Publish now</button>
              </>
            ) : (
              <>
                <button type="button" className={smallPrimary} disabled={pending} onClick={() => save(current === 'scheduled' ? 'schedule' : 'publish')}>{current === 'scheduled' ? 'Save schedule' : 'Update post'}</button>
                {current === 'scheduled' && <button type="button" className={smallBtn} disabled={pending} onClick={() => save('publish')}>Publish now</button>}
                <button type="button" className={smallBtn} disabled={pending} onClick={() => save('unpublish')}>{current === 'scheduled' ? 'Unschedule (back to draft)' : 'Unpublish (back to draft)'}</button>
              </>
            )}
            {id && (
              <button type="button" className="ml-auto text-xs text-[#8a3520] underline" disabled={pending} onClick={async () => {
                if (!confirm('Delete this post permanently? This cannot be undone.')) return
                if (await run(() => deletePost({ data: { id } }))) onDeleted()
              }}>Delete post</button>
            )}
          </div>
        </div>
      </form>
    </Panel>
  )
}
