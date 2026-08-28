'use client'

import Pagination from '@/components/ui/Pagination'
import { apiClient } from '@/lib/api'
import { AlertCircle, Filter, ScrollText, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuditLogEntry {
  id: number
  admin_email: string
  action: string
  target_type: string
  target_id: string
  target_name: string | null
  details: string | null
  ip_address: string | null
  created_at: string
}

interface AuditLogPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_LABELS: Record<string, string> = {
  approve_workshop: 'Aprovar Oficina',
  reject_workshop: 'Rejeitar Oficina',
  send_notification: 'Enviar Notificação',
  disable_workshop: 'Desabilitar Oficina',
}

const ACTION_COLORS: Record<string, string> = {
  approve_workshop: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  reject_workshop: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
  send_notification: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  disable_workshop: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
}

const DEFAULT_ACTION_COLOR = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'

const PAGE_SIZE = 30

export default function AuditLogPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [pagination, setPagination] = useState<AuditLogPagination | null>(null)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [adminFilter, setAdminFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuditLog()
    }, 400)
    return () => clearTimeout(timer)
  }, [page, actionFilter, adminFilter, dateFrom, dateTo])

  const loadAuditLog = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        router.push('/login')
        return
      }
      apiClient.setToken(token)
      const { data, error } = await apiClient.getAuditLog({
        page,
        action: actionFilter || undefined,
        admin: adminFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })
      if (data && !error) {
        const body = data as any
        setEntries(Array.isArray(body.data) ? body.data : [])
        setPagination(body.pagination ?? null)
      } else {
        setEntries([])
        setPagination(null)
      }
    } catch {
      setEntries([])
      setPagination(null)
    }
    setLoading(false)
  }

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value)
    setPage(1)
  }

  const handleAdminFilterChange = (value: string) => {
    setAdminFilter(value)
    setPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  const clearFilters = () => {
    setActionFilter('')
    setAdminFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = Boolean(actionFilter || adminFilter || dateFrom || dateTo)

  const formatAction = (action: string) => ACTION_LABELS[action] || action

  const getActionColor = (action: string) => ACTION_COLORS[action] || DEFAULT_ACTION_COLOR

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`
  }

  const formatTarget = (entry: AuditLogEntry) => {
    if (entry.target_name) return entry.target_name
    if (entry.target_type && entry.target_id) return `${entry.target_type} #${entry.target_id}`
    return '—'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <ScrollText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Audit Log</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Histórico de ações realizadas pelos administradores</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  aria-label="Buscar por email do admin"
                  placeholder="Buscar por email do admin..."
                  value={adminFilter}
                  onChange={(e) => handleAdminFilterChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <select
                aria-label="Filtrar por ação"
                value={actionFilter}
                onChange={(e) => handleActionFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              >
                <option value="">Todas as ações</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Data inicial"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              />
              <span className="text-gray-400 dark:text-gray-500 text-sm">até</span>
              <input
                type="date"
                aria-label="Data final"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum registro encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">Não há registros de auditoria com os filtros selecionados no momento.</p>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Data/Hora
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Admin
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Ação
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Alvo
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatDateTime(entry.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.admin_email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getActionColor(entry.action)}`}>
                          {formatAction(entry.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatTarget(entry)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{entry.details || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
