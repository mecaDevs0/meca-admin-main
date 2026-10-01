'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Search, LayoutDashboard, Building2, Users, CalendarCheck, TrendingUp,
  Megaphone, Ticket, Bell, Star, FileText, Receipt, Settings, Activity,
  ScrollText, UserPlus, Wrench, BarChart3, Heart, Car, Command, Filter,
} from 'lucide-react'

interface SearchResult {
  id: string
  label: string
  description?: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
}

const PAGES: Omit<SearchResult, 'action'>[] = [
  { id: 'home', label: 'Dashboard', description: 'Visão geral do marketplace', category: 'Páginas', icon: LayoutDashboard },
  { id: 'workshops', label: 'Oficinas', description: 'Gerenciar oficinas', category: 'Páginas', icon: Building2 },
  { id: 'bookings', label: 'Agendamentos', description: 'Todos os agendamentos', category: 'Páginas', icon: CalendarCheck },
  { id: 'users', label: 'Usuários', description: 'Clientes e oficinas', category: 'Páginas', icon: Users },
  { id: 'services', label: 'Serviços', description: 'Catálogo de serviços', category: 'Páginas', icon: Wrench },
  { id: 'marketing', label: 'Marketing', description: 'Overview de marketing', category: 'Páginas', icon: TrendingUp },
  { id: 'marketing-funnel', label: 'Funil de Marketing', description: 'Conversão por etapa e canal', category: 'Páginas', icon: Filter },
  { id: 'campaigns', label: 'Campanhas Push', description: 'Notificações push', category: 'Páginas', icon: Megaphone },
  { id: 'promo-codes', label: 'Cupons', description: 'Promo codes e flash', category: 'Páginas', icon: Ticket },
  { id: 'referrals', label: 'Indicações', description: 'Programa de indicação', category: 'Páginas', icon: UserPlus },
  { id: 'notifications', label: 'Notificações', description: 'Enviar notificações', category: 'Páginas', icon: Bell },
  { id: 'reviews', label: 'Avaliações', description: 'Reviews dos clientes', category: 'Páginas', icon: Star },
  { id: 'reports', label: 'Relatórios', description: 'Analytics financeiro', category: 'Páginas', icon: FileText },
  { id: 'invoices', label: 'Notas Fiscais', description: 'NFs do marketplace', category: 'Páginas', icon: Receipt },
  { id: 'growth', label: 'Growth Analytics', description: 'Cohorts, retenção, churn', category: 'Páginas', icon: BarChart3 },
  { id: 'engagement', label: 'Engajamento', description: 'Fidelidade, reativação', category: 'Páginas', icon: Heart },
  { id: 'vehicles', label: 'Veículos', description: 'Frota do marketplace', category: 'Páginas', icon: Car },
  { id: 'audit-log', label: 'Audit Log', description: 'Histórico de ações', category: 'Páginas', icon: ScrollText },
  { id: 'settings', label: 'Configurações', description: 'Taxa MECA, configs', category: 'Páginas', icon: Settings },
  { id: 'api-status', label: 'Status API', description: 'Saúde e performance', category: 'Páginas', icon: Activity },
]

const PAGE_ROUTES: Record<string, string> = {
  home: '/dashboard',
  workshops: '/dashboard/workshops',
  bookings: '/dashboard/bookings',
  users: '/dashboard/users',
  services: '/dashboard/services',
  marketing: '/dashboard/marketing',
  'marketing-funnel': '/dashboard/marketing/funnel',
  campaigns: '/dashboard/campaigns',
  'promo-codes': '/dashboard/promo-codes',
  referrals: '/dashboard/referrals',
  notifications: '/dashboard/notifications',
  reviews: '/dashboard/reviews',
  reports: '/dashboard/reports',
  invoices: '/dashboard/invoices',
  growth: '/dashboard/growth',
  engagement: '/dashboard/engagement',
  vehicles: '/dashboard/vehicles',
  'audit-log': '/dashboard/audit-log',
  settings: '/dashboard/settings',
  'api-status': '/dashboard/api-status',
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results: SearchResult[] = PAGES
    .filter((p) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        p.label.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q))
      )
    })
    .map((p) => ({
      ...p,
      action: () => {
        router.push(PAGE_ROUTES[p.id] || '/dashboard')
        setOpen(false)
      },
    }))

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        results[selectedIndex].action()
      }
    },
    [results, selectedIndex],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-lg z-[101] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar páginas, oficinas, clientes..."
                className="flex-1 bg-transparent text-sm text-[#252940] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 border border-gray-200 dark:border-gray-600">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((result, i) => (
                  <button
                    key={result.id}
                    onClick={result.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? 'bg-[#00c977]/8 dark:bg-[#00c977]/10'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      i === selectedIndex
                        ? 'bg-[#00c977]/15 text-[#00c977]'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      <result.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        i === selectedIndex
                          ? 'text-[#00c977]'
                          : 'text-[#252940] dark:text-white'
                      }`}>
                        {result.label}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{result.description}</p>
                      )}
                    </div>
                    {i === selectedIndex && (
                      <span className="text-[10px] text-gray-400">↵</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-3">
                <span>↑↓ navegar</span>
                <span>↵ abrir</span>
                <span>esc fechar</span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
