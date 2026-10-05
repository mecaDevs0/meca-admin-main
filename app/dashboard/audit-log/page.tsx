'use client'

import Pagination from '@/components/ui/Pagination'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  AlertCircle, ChevronDown, ChevronRight, Download,
  Filter, ScrollText, Search, Shield, X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface AuditLogEntry {
  id: number
  admin_email: string
  action: string
  target_type: string | null
  target_id: string | null
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
  push_campaign_sent: 'Campanha Push Enviada',
  promo_code_created: 'Cupom Criado',
  promo_code_updated: 'Cupom Atualizado',
  promo_code_activated: 'Cupom Ativado',
  promo_code_deactivated: 'Cupom Desativado',
  hide_review: 'Ocultar Avaliação',
  unhide_review: 'Exibir Avaliação',
  respond_review: 'Responder Avaliação',
}

type ActionCategory = 'workshop' | 'notification' | 'promo' | 'review' | 'other'

const ACTION_CATEGORY: Record<string, ActionCategory> = {
  approve_workshop: 'workshop',
  reject_workshop: 'workshop',
  send_notification: 'notification',
  push_campaign_sent: 'notification',
  promo_code_created: 'promo',
  promo_code_updated: 'promo',
  promo_code_activated: 'promo',
  promo_code_deactivated: 'promo',
  hide_review: 'review',
  unhide_review: 'review',
  respond_review: 'review',
}

const CATEGORY_COLORS: Record<ActionCategory, string> = {
  workshop: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  notification: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  promo: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  review: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  other: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700',
}

const CATEGORY_DOTS: Record<ActionCategory, string> = {
  workshop: 'bg-green-500',
  notification: 'bg-blue-500',
  promo: 'bg-purple-500',
  review: 'bg-amber-500',
  other: 'bg-gray-400',
}

const getActionColor = (action: string) => CATEGORY_COLORS[ACTION_CATEGORY[action] || 'other']
const getActionDot = (action: string) => CATEGORY_DOTS[ACTION_CATEGORY[action] || 'other']
const formatAction = (action: string) => ACTION_LABELS[action] || action.replace(/_/g, ' ')

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const formatTarget = (entry: AuditLogEntry) => {
  if (entry.target_name) return entry.target_name
  if (entry.target_type && entry.target_id) return `${entry.target_type} #${entry.target_id}`
  return '—'
}

function parseDetails(details: string | null): Record<string, unknown> | null {
  if (!details) return null
  try { return JSON.parse(details) } catch { return null }
}

function ExpandableDetails({ details }: { details: string | null }) {
  const parsed = parseDetails(details)
  if (!parsed) return <span className="text-sm text-gray-500 dark:text-gray-400">{details || '—'}</span>

  return (
    <div className="space-y-1.5">
      {Object.entries(parsed).map(([k, v]) => (
        <div key={k} className="flex gap-2 text-xs">
          <span className="font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">{k}:</span>
          <span className="text-gray-700 dark:text-gray-300 break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [pagination, setPagination] = useState<AuditLogPagination | null>(null)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [adminFilter, setAdminFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { window.location.replace('/login/'); return }
    apiClient.setToken(token)
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadAuditLog(), 300)
    return () => clearTimeout(timer)
  }, [page, actionFilter, adminFilter, dateFrom, dateTo])

  const loadAuditLog = async () => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      apiClient.setToken(token)
      const { data, error: apiError } = await apiClient.getAuditLog({
        page,
        action: actionFilter || undefined,
        admin: adminFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })

      if (!mountedRef.current) return

      if (apiError) {
        setError(apiError)
        setEntries([])
        setPagination(null)
      } else if (data) {
        const body = data as any
        setEntries(Array.isArray(body.data) ? body.data : [])
        setPagination(body.pagination ?? null)
      }
    } catch {
      if (mountedRef.current) {
        setError('Falha ao carregar dados')
        setEntries([])
        setPagination(null)
      }
    }

    if (mountedRef.current) setLoading(false)
  }

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setPage(1)
  }

  const clearFilters = () => {
    setActionFilter('')
    setAdminFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const exportCsv = () => {
    if (entries.length === 0) return
    const header = 'Data,Admin,Ação,Alvo,Detalhes,IP'
    const rows = entries.map(e => [
      formatDateTime(e.created_at),
      e.admin_email,
      formatAction(e.action),
      formatTarget(e),
      (e.details || '').replace(/"/g, '""'),
      e.ip_address || '',
    ].map(c => `"${c}"`).join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasActiveFilters = Boolean(actionFilter || adminFilter || dateFrom || dateTo)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <ScrollText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Audit Log</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Histórico de ações administrativas
                {pagination && <span className="ml-2 font-medium text-[#252940] dark:text-white">({pagination.total} registros)</span>}
              </p>
            </div>
          </div>
          <button
            onClick={exportCsv}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#252940] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  aria-label="Buscar por email do admin"
                  placeholder="Buscar por email do admin..."
                  value={adminFilter}
                  onChange={(e) => handleFilterChange(setAdminFilter)(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 text-[#252940] dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                aria-label="Filtrar por ação"
                value={actionFilter}
                onChange={(e) => handleFilterChange(setActionFilter)(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 text-[#252940] dark:text-white text-sm"
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
                onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 text-[#252940] dark:text-white text-sm"
              />
              <span className="text-gray-400 text-sm">até</span>
              <input
                type="date"
                aria-label="Data final"
                value={dateTo}
                onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 text-[#252940] dark:text-white text-sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 && !error ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm p-8 text-center">
            <Shield className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#252940] dark:text-white mb-1">Nenhum registro</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? 'Nenhum registro encontrado com os filtros selecionados.'
                : 'Não há registros de auditoria ainda.'}
            </p>
          </div>
        ) : entries.length > 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                    <th className="w-8 px-2" />
                    <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Data/Hora</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Admin</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Ação</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Alvo</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const isExpanded = expandedId === entry.id
                    const hasDetails = entry.details && entry.details !== 'null'
                    return (
                      <tr key={entry.id} className="group">
                        <td colSpan={6} className="p-0">
                          <div
                            onClick={() => hasDetails && setExpandedId(isExpanded ? null : entry.id)}
                            className={`flex items-center border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
                          >
                            <div className="w-8 px-2 py-3 flex items-center justify-center">
                              {hasDetails ? (
                                isExpanded
                                  ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                  : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              ) : <div className={`w-1.5 h-1.5 rounded-full ${getActionDot(entry.action)}`} />}
                            </div>
                            <div className="flex-none w-[140px] px-4 py-3">
                              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {formatDateTime(entry.created_at)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-[160px] px-4 py-3">
                              <span className="text-sm font-medium text-[#252940] dark:text-white truncate block">
                                {entry.admin_email}
                              </span>
                            </div>
                            <div className="flex-none w-[200px] px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${getActionColor(entry.action)}`}>
                                {formatAction(entry.action)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-[140px] px-4 py-3">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{formatTarget(entry)}</span>
                            </div>
                            <div className="flex-none w-[120px] px-4 py-3">
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{entry.ip_address || '—'}</span>
                            </div>
                          </div>
                          {isExpanded && hasDetails && (
                            <div className="px-12 py-3 bg-gray-50/80 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700/30">
                              <ExpandableDetails details={entry.details} />
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </motion.div>
    </div>
  )
}
