import { createMiddleware, createStart } from '@tanstack/react-start'

/**
 * Global server-function guard: intentional AppErrors (permission, validation, conflict) pass through;
 * anything unexpected — database errors, gateway failures — is logged on the server and replaced
 * with a generic message so internal details never reach the browser.
 */
const safeErrors = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  try {
    return await next()
  } catch (e) {
    const err = e as { expose?: boolean; isRedirect?: boolean; isNotFound?: boolean; name?: string; message?: string }
    if (err?.expose || err?.isRedirect || err?.isNotFound) throw e
    // Input validation failures carry field details that are safe and useful to show.
    if (typeof err?.message === 'string' && err.message.trimStart().startsWith('[') && err.message.includes('"path"')) throw e
    console.error('server function failed', e)
    throw new Error('Something went wrong on our side. Please try again in a moment.')
  }
})

export const startInstance = createStart(() => ({ functionMiddleware: [safeErrors] }))
