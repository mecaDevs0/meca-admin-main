'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'
import { motion } from 'framer-motion'
import {
  TrendingUp, DollarSign, Target, Users, RefreshCw,
  ArrowDownRight, ArrowUpRight, ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

interface OverviewData {
  total_installs: number
  organic_installs: number
  paid_installs: number
  total_cost: number
  total_revenue: number
  cac: number
  roas: number
  installs_by_source: Array<{ media_source: string; installs: number }>
  installs_by_day: Array<{ day: string; organic: number; paid: number }>
}

interface FunnelData {
  installs: number
  registrations: number
  bookings: number
  payments: number
  conversion_rates: {
    install_to_registration: number
    registration_to_booking: number
    booking_to_payment: number
    overall: number
  }
}

interface ChannelData {
  media_source: string
  installs: number
  registrations: number
  purchases: number
  cost: number
  revenue: number
  cac: number
  roas: number
}

const SOURCE_LABELS: Record<string, string> = {
  organic: 'Orgânico',
  'Meta Ads': 'Meta',
  restricted: 'Meta',
  tiktokads: 'TikTok',
  googleadwords_int: 'Google',
}

const SOURCE_COLORS: Record<string, string> = {
  organic: '#00C977',
  'Meta Ads': '#1877F2',
  restricted: '#1877F2',
  tiktokads: '#010101',
  googleadwords_int: '#FBBC04',
}

function getSourceLabel(source: string) {
  return SOURCE_LABELS[source] || source
}

function getSourceColor(source: string) {
  return SOURCE_COLORS[source] || '#6B7280'
}

function SourceBadge({ source }: { source: string | null }) {
  if (!source) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        —
      </span>
    )
  }
  const color = getSourceColor(source)
  const label = getSourceLabel(source)
  const isLight = source === 'googleadwords_int'
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{
        backgroundColor: `${color}18`,
        color: isLight ? '#92400E' : color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  )
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatCompact = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toString()
}

export default function MarketingPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [period, setPeriod] = useState('30d')
  const [funnelSource, setFunnelSource] = useState('all')
  const [sortColumn, setSortColumn] = useState<keyof ChannelData>('installs')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      window.location.replace('/login/')
      return
    }
    apiClient.setToken(token)
    loadData()
  }, [period])

  useEffect(() => {
    loadFunnel()
  }, [period, funnelSource])

  const loadData = async () => {
    setLoading(true)
    try {
      const [overviewRes, channelsRes] = await Promise.all([
        apiClient.getMarketingOverview(period),
        apiClient.getMarketingChannels(period),
      ])

      if (overviewRes.data?.data) setOverview(overviewRes.data.data)
      if (channelsRes.data?.data) setChannels(channelsRes.data.data)
    } catch {
      showToast.error('Erro ao carregar dados de marketing')
    }
    setLoading(false)
  }

  const loadFunnel = async () => {
    try {
      const res = await apiClient.getMarketingFunnel(period, funnelSource !== 'all' ? funnelSource : undefined)
      if (res.data?.data) setFunnel(res.data.data)
    } catch {
      // silent
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await apiClient.syncMarketingData()
      if (res.data?.success) {
        showToast.success('Dados sincronizados', `${res.data.upserted || 0} registros atualizados`)
        await loadData()
      } else {
        showToast.error('Erro na sincronização', res.data?.error || res.error || 'Erro desconhecido')
      }
    } catch {
      showToast.error('Erro de conexão')
    }
    setSyncing(false)
  }

  const handleSort = (col: keyof ChannelData) => {
    if (sortColumn === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDir('desc')
    }
  }

  const sortedChannels = [...channels].sort((a, b) => {
    const av = a[sortColumn] ?? 0
    const bv = b[sortColumn] ?? 0
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'desc' ? bv - av : av - bv
    }
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv))
  })

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  if (loading) return <Loading message="Carregando métricas de marketing..." size={200} />

  if (!overview) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 dark:border-gray-700/50 shadow-lg">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">
            Nenhum dado de marketing disponível
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Os dados aparecerão após as primeiras instalações via campanhas e configuração do webhook do AppsFlyer.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c977] to-[#00b369] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar dados'}
          </button>
        </div>
      </div>
    )
  }

  const funnelSteps = funnel ? [
    { label: 'Instalação', value: funnel.installs, rate: 100 },
    { label: 'Cadastro', value: funnel.registrations, rate: funnel.conversion_rates.install_to_registration },
    { label: 'Agendamento', value: funnel.bookings, rate: funnel.conversion_rates.registration_to_booking },
    { label: 'Pagamento', value: funnel.payments, rate: funnel.conversion_rates.booking_to_payment },
  ] : []

  const maxFunnelValue = funnelSteps.length > 0 ? Math.max(...funnelSteps.map(s => s.value), 1) : 1

  function rateColor(rate: number) {
    if (rate > 30) return 'text-green-600 dark:text-green-400'
    if (rate >= 10) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  function rateBarColor(rate: number) {
    if (rate > 30) return '#00C977'
    if (rate >= 10) return '#EAB308'
    return '#EF4444'
  }

  const uniqueSources = ['all', ...channels.map(c => c.media_source)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.06 }}
        className="max-w-[1920px] mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Marketing</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Métricas de aquisição e performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
            {['7d', '30d', '90d'].map((v) => (
              <button
                key={v}
                onClick={() => setPeriod(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === v
                    ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: 'Instalações',
              value: overview.total_installs,
              sub: `${overview.organic_installs} orgânico · ${overview.paid_installs} pago`,
              icon: Users,
              gradient: 'from-[#00c977] to-[#00b369]',
            },
            {
              label: 'CAC Médio',
              value: overview.cac > 0 ? formatCurrency(overview.cac) : '—',
              sub: 'custo / instalação paga',
              icon: Target,
              gradient: 'from-blue-500 to-blue-600',
            },
            {
              label: 'ROAS',
              value: overview.roas > 0 ? `${overview.roas}x` : '—',
              sub: 'receita / custo',
              icon: TrendingUp,
              gradient: 'from-purple-500 to-purple-600',
            },
            {
              label: 'Custo Total',
              value: overview.total_cost > 0 ? formatCurrency(overview.total_cost) : 'R$ 0',
              sub: 'investimento em ads',
              icon: DollarSign,
              gradient: 'from-[#252940] to-[#1B1D2E]',
            },
            {
              label: 'Receita Atribuída',
              value: overview.total_revenue > 0 ? formatCurrency(overview.total_revenue) : 'R$ 0',
              sub: 'de clientes via ads',
              icon: DollarSign,
              gradient: 'from-amber-500 to-amber-600',
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
            >
              <div className={`w-9 h-9 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-3`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#252940] dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Installs Chart */}
        {overview.installs_by_day.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <h2 className="text-base font-semibold text-[#252940] dark:text-white mb-4">
              Instalações por dia
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overview.installs_by_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  fontSize={11}
                  tickFormatter={(v) => {
                    const d = new Date(v)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  labelFormatter={(v) => new Date(String(v)).toLocaleDateString('pt-BR')}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229,231,235,0.5)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}
                />
                <Legend />
                <Bar dataKey="organic" name="Orgânico" fill="#00C977" radius={[4, 4, 0, 0]} stackId="stack" />
                <Bar dataKey="paid" name="Pago" fill="#1877F2" radius={[4, 4, 0, 0]} stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Funnel */}
        {funnel && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#252940] dark:text-white">
                Funil de Conversão
              </h2>
              <div className="relative">
                <select
                  value={funnelSource}
                  onChange={(e) => setFunnelSource(e.target.value)}
                  className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg px-3 py-1.5 pr-7 border-0 focus:ring-2 focus:ring-[#00c977]"
                >
                  {uniqueSources.map(s => (
                    <option key={s} value={s}>{s === 'all' ? 'Todos' : getSourceLabel(s)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              {funnelSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="w-24 text-right">
                    <span className="text-sm font-medium text-[#252940] dark:text-white">{step.label}</span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max((step.value / maxFunnelValue) * 100, 2)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full rounded-full flex items-center justify-end pr-3"
                        style={{ backgroundColor: rateBarColor(step.rate) }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow-sm">
                          {formatCompact(step.value)}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    {i > 0 ? (
                      <span className={`text-sm font-semibold ${rateColor(step.rate)}`}>
                        {step.rate}%
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-400">100%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {funnel.conversion_rates.overall > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-right">
                Conversão geral (install → pagamento): <span className="font-semibold text-[#252940] dark:text-white">{funnel.conversion_rates.overall}%</span>
              </p>
            )}
          </motion.div>
        )}

        {/* Channels Table */}
        {channels.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden"
          >
            <div className="p-5 pb-0">
              <h2 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Canais</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {[
                      { key: 'media_source' as keyof ChannelData, label: 'Canal' },
                      { key: 'installs' as keyof ChannelData, label: 'Instalações' },
                      { key: 'registrations' as keyof ChannelData, label: 'Cadastros' },
                      { key: 'purchases' as keyof ChannelData, label: 'Pagamentos' },
                      { key: 'cost' as keyof ChannelData, label: 'Custo' },
                      { key: 'revenue' as keyof ChannelData, label: 'Receita' },
                      { key: 'cac' as keyof ChannelData, label: 'CAC' },
                      { key: 'roas' as keyof ChannelData, label: 'ROAS' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          {sortColumn === col.key && (
                            sortDir === 'desc'
                              ? <ArrowDownRight className="w-3 h-3" />
                              : <ArrowUpRight className="w-3 h-3" />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {sortedChannels.map((ch) => (
                    <tr key={ch.media_source} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <SourceBadge source={ch.media_source} />
                      </td>
                      <td className="px-4 py-3 font-medium text-[#252940] dark:text-white">{ch.installs}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.registrations}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.purchases}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.cost > 0 ? formatCurrency(ch.cost) : '—'}</td>
                      <td className="px-4 py-3 font-medium text-[#252940] dark:text-white">{ch.revenue > 0 ? formatCurrency(ch.revenue) : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.cac > 0 ? formatCurrency(ch.cac) : '—'}</td>
                      <td className="px-4 py-3">
                        {ch.roas > 0 ? (
                          <span className={ch.roas >= 1 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                            {ch.roas}x
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
