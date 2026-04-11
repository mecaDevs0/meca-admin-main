'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  label?: string
}

interface State {
  error: Error | null
  info: React.ErrorInfo | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.label || 'unknown', error, info)
    this.setState({ error, info })
  }

  handleReset = () => {
    this.setState({ error: null, info: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const { error, info } = this.state
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-red-300 dark:border-red-700/50 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-700 dark:text-red-300">
                Erro ao renderizar {this.props.label || 'página'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A tela crashou durante o render. Envie esse stack trace ao desenvolvedor.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Mensagem</p>
            <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-lg p-3 text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap break-words">
              {error.name}: {error.message}
            </pre>
          </div>

          {error.stack && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Stack</p>
              <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64">
                {error.stack}
              </pre>
            </div>
          )}

          {info?.componentStack && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Component stack</p>
              <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64">
                {info.componentStack}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#00c977] hover:bg-[#00b369] transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => (typeof window !== 'undefined' ? window.location.reload() : null)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    )
  }
}
