'use client'

import { useEffect } from 'react'
import { initSentry, Sentry } from '@/lib/sentry'

function SentryFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Algo deu errado</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Ocorreu um erro inesperado. Tente recarregar a página.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '8px 20px', borderRadius: 8, background: '#00C977', color: '#0A0A0A', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Recarregar
        </button>
      </div>
    </div>
  )
}

export function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { initSentry() }, [])

  return (
    <Sentry.ErrorBoundary fallback={<SentryFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  )
}
