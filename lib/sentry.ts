export const Sentry = {
  captureException(_error: unknown, _context?: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
      console.error('[Sentry stub]', _error)
    }
  },
}
