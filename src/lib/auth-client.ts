// Browser-side Netlify Identity helpers. Loaded lazily so the main marketing site does not ship the auth client.
// If the auth bundle can't be downloaded (an old tab after a new deploy, a flaky connection, or an expired
// preview-link session), the browser throws a cryptic "Failed to fetch dynamically imported module" error.
// Retry once, then surface a readable message.
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|error loading dynamically/i

export async function identity() {
  try {
    return await import('@netlify/identity')
  } catch (e) {
    if (!CHUNK_ERROR.test(String((e as Error)?.message))) throw e
    await new Promise((r) => setTimeout(r, 600))
    try {
      return await import('@netlify/identity')
    } catch {
      throw Object.assign(new Error('Sign-in could not load. Please refresh the page and try again.'), { name: 'ChunkLoadError' })
    }
  }
}

export function authErrorMessage(e: unknown): string {
  const err = e as { status?: number; message?: string; name?: string }
  if (err?.name === 'ChunkLoadError' || CHUNK_ERROR.test(err?.message ?? ''))
    return 'Sign-in could not load. Please refresh the page and try again. If you opened an older preview link, use the main site address instead.'
  if (err?.name === 'MissingIdentityError') return 'Sign-in is not available right now. Please try again later.'
  switch (err?.status) {
    case 401:
      return 'Incorrect email or password, or your email has not been confirmed yet.'
    case 403:
      return 'New registrations are currently closed. Please contact Nexora Academy.'
    case 422:
      return err.message?.includes('assword') ? 'Please choose a stronger password (at least 8 characters).' : 'Please check your details and try again.'
    case 429:
      return 'Too many attempts. Please wait a few minutes and try again.'
  }
  if (err?.message?.toLowerCase().includes('not confirmed')) return 'Please confirm your email address first — check your inbox for the confirmation link.'
  return err?.message || 'Something went wrong. Please try again.'
}

export async function signOut() {
  try {
    const { logout } = await identity()
    await logout()
  } finally {
    window.location.href = '/academy/login'
  }
}
