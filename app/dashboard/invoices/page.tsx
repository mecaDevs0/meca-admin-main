'use client'

import Pagination from '@/components/ui/Pagination'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Filter,
  Receipt,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Invoice {
  id: number
  workshop_id: number
  workshop_name?: string | null
  booking_id?: string | null
  issuer_type: 'meca' | 'workshop'
  asaas_status: string
  value: number
  pdf_url?: string | null
  xml_url?: string | null
  invoice_number?: string | null
  error_message?: string | null
  created_at: string
}

interface InvoicesResponse {
  success: boolean
  data: Invoice[]
  total: number
  page: number
  totalPages: number
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  SCHEDULED: 'Agendada',
  AUTHORIZED: 'Emitida',
  ERROR: 'Erro',
  CANCELLED: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  SCHEDULED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  AUTHORIZED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  ERROR: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700',
}

const DEFAULT_STATUS_COLOR = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'

const PAGE_SIZE = 20

export default function AdminInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadInvoices()
  }, [page, filterType, filterStatus, router])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        router.push('/login')
        return
      }
      apiClient.setToken(token)
      const { data, error } = await apiClient.getInvoices({
        issuerType: filterType || undefined,
        status: filterStatus || undefined,
        page,
        limit: PAGE_SIZE,
      })
      if (data && !error) {
        const body = data as InvoicesResponse
        setInvoices(Array.isArray(body.data) ? body.data : [])
        setTotal(body.total ?? 0)
      } else {
        setInvoices([])
        setTotal(0)
        showToast.error('Erro ao carregar notas fiscais', error)
      }
    } catch {
      setInvoices([])
      setTotal(0)
      showToast.error('Erro ao carregar notas fiscais', 'Não foi possível conectar à API')
    }
    setLoading(false)
  }

  const handleTypeFilterChange = (value: string) => {
    setFilterType(value)
    setPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value)
    setPage(1)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const totalMecaRevenue = invoices
    .filter((i) => i.issuer_type === 'meca' && i.asaas_status === 'AUTHORIZED')
    .reduce((sum, i) => sum + Number(i.value), 0)
  const errorCount = invoices.filter((i) => i.asaas_status === 'ERROR').length
  const authorizedCount = invoices.filter((i) => i.asaas_status === 'AUTHORIZED').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Notas Fiscais</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">NFs emitidas por todas as oficinas da plataforma</p>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total de NFs</p>
            </div>
            <p className="text-2xl font-bold text-[#252940] dark:text-white">{total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receita MECA (NFs, pág. atual)</p>
            </div>
            <p className="text-2xl font-bold text-[#00c977]">{formatCurrency(totalMecaRevenue)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Emitidas (pág. atual)</p>
            </div>
            <p className="text-2xl font-bold text-[#252940] dark:text-white">{authorizedCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border shadow-sm ${
              errorCount > 0 ? 'border-red-300/50 dark:border-red-700/50' : 'border-white/20 dark:border-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                errorCount > 0 ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500'
              }`}>
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Com erro (pág. atual)</p>
            </div>
            <p className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#252940] dark:text-white'}`}>
              {errorCount}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <select
                aria-label="Filtrar por tipo de emissor"
                value={filterType}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="workshop">Oficina</option>
                <option value="meca">MECA</option>
              </select>
            </div>

            <select
              aria-label="Filtrar por status"
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma nota fiscal encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400">Não há notas fiscais com os filtros selecionados no momento.</p>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    {['ID', 'Oficina', 'Tipo', 'Valor', 'Status', 'Data', 'Ações'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{inv.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {inv.workshop_name ?? `#${inv.workshop_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${
                          inv.issuer_type === 'meca'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                        }`}>
                          {inv.issuer_type === 'meca' ? 'MECA' : 'Oficina'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(Number(inv.value))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${STATUS_COLORS[inv.asaas_status] ?? DEFAULT_STATUS_COLOR}`}>
                          {STATUS_LABELS[inv.asaas_status] ?? inv.asaas_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(inv.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {inv.pdf_url && (
                            <a
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ver PDF"
                              aria-label={`Ver PDF da nota fiscal ${inv.id}`}
                              className="text-[#00c977] hover:text-[#00b369] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {inv.asaas_status === 'ERROR' && (
                            <AlertCircle
                              className="w-4 h-4 text-red-500 dark:text-red-400"
                              aria-label={inv.error_message ?? 'Erro na emissão'}
                            />
                          )}
                          {!inv.pdf_url && inv.asaas_status !== 'ERROR' && (
                            <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {total > 0 && (
          <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
