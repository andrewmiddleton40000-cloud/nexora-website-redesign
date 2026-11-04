// Browser-side Netlify Identity helpers. Loaded lazily so the main marketing site does not ship the auth client.
export async function identity() {
  return import('@netlify/identity')
}

export function authErrorMessage(e: unknown): string {
  const err = e as { status?: number; message?: string; name?: string }
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
