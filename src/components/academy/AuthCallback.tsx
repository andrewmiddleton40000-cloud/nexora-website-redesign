import { useEffect } from 'react'

/**
 * Netlify Identity emails link back to the site with a token in the URL hash
 * (#confirmation_token=…, #recovery_token=…, #invite_token=…). This handles them on any page.
 */
export function AuthCallback() {
  useEffect(() => {
    const hash = window.location.hash
    if (!/(confirmation|recovery|invite|email_change)_token=|access_token=/.test(hash)) return
    import('@netlify/identity')
      .then(async ({ handleAuthCallback }) => {
        const r = await handleAuthCallback()
        if (!r) return
        if (r.type === 'recovery') window.location.href = '/academy/login?mode=reset'
        else if (r.type === 'invite') {
          if (r.token) sessionStorage.setItem('nda_invite_token', r.token)
          window.location.href = '/academy/login?mode=invite'
        } else window.location.href = '/academy/dashboard'
      })
      .catch((e) => {
        console.error('auth callback failed', e)
        window.location.href = '/academy/login'
      })
  }, [])
  return null
}
