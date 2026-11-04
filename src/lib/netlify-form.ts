/** Submits a registered Netlify Form. Posts to the static registration file because the SSR handler owns "/". */
export async function submitNetlifyForm(form: HTMLFormElement) {
  const body = new URLSearchParams()
  new FormData(form).forEach((v, k) => body.append(k, String(v)))
  const res = await fetch('/__forms.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error('Submission failed')
  // If form handling is not active the static file is served back unchanged — treat that as a failure, not a success.
  if (/\bdata-netlify\s*=/i.test(await res.text())) throw new Error('Form handling unavailable')
}
