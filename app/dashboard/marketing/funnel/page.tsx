'use client'

import { apiClient } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'
import { motion } from 'framer-motion'
import {
  TrendingUp, Target, Users, RefreshCw, ArrowRight,
  Download, ChevronDown, ArrowLeft, Filter,
  DollarSign, BarChart3,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell,
  LineChart, Line, Legend,
} from 'recharts'

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

const SOURCE_LABELS: Record<string, string> = {
  organic: 'Orgânico',
  'Meta Ads': 'Meta Ads',
  restricted: 'Meta Ads',
  tiktokads: 'TikTok Ads',
  googleadwords_int: 'Google Ads',
}

const SOURCE_COLORS: Record<string, string> = {
  organic: '#00C977',
  'Meta Ads': '#1877F2',
  restricted: '#1877F2',
  tiktokads: '#FF0050',
  googleadwords_int: '#FBBC04',
}

const FUNNEL_COLORS = ['#00C977', '#3B82F6', '#8B5CF6', '#F59E0B']

function getSourceLabel(source: string) {
  return SOURCE_LABELS[source] || source
}

function getSourceColor(source: string) {
  return SOURCE_COLORS[source] || '#6B7280'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatCompact = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toString()
}

const PERIODS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

export default function MarketingFunnelPage() {
  const router = useRouter()
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [period, setPeriod] = useState('30d')
  const [selectedSource, setSelectedSource] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      window.location.replace('/login/')
      return
    }
    apiClient.setToken(token)
    loadAll()
  }, [period])

  useEffect(() => {
    loadFunnel()
  }, [period, selectedSource])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [channelsRes, overviewRes] = await Promise.all([
        apiClient.getMarketingChannels(period),
        apiClient.getMarketingOverview(period),
      ])
      if (channelsRes.data?.data) setChannels(channelsRes.data.data)
      if (overviewRes.data?.data) setOverview(overviewRes.data.data)
    } catch { /* handled by empty state */ }
    setLoading(false)
  }

  const loadFunnel = async () => {
    try {
      const res = await apiClient.getMarketingFunnel(
        period,
        selectedSource !== 'all' ? selectedSource : undefined,
      )
      if (res.data?.data) setFunnel(res.data.data)
    } catch { /* silent */ }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await apiClient.syncMarketingData()
      if (res.data?.success) {
        await loadAll()
      }
    } catch { /* silent */ }
    setSyncing(false)
  }

  const funnelSteps = useMemo(() => {
    if (!funnel) return []
    return [
      { name: 'Instalação', value: funnel.installs, rate: 100 },
      { name: 'Cadastro', value: funnel.registrations, rate: funnel.conversion_rates.install_to_registration },
      { name: 'Agendamento', value: funnel.bookings, rate: funnel.conversion_rates.registration_to_booking },
      { name: 'Pagamento', value: funnel.payments, rate: funnel.conversion_rates.booking_to_payment },
    ]
  }, [funnel])

  const uniqueSources = useMemo(
    () => ['all', ...channels.map(c => c.media_source)],
    [channels],
  )

  const cacChartData = useMemo(
    () => channels
      .filter(c => c.cac > 0)
      .sort((a, b) => a.cac - b.cac)
      .map(c => ({
        name: getSourceLabel(c.media_source),
        cac: c.cac,
        roas: c.roas,
        fill: getSourceColor(c.media_source),
      })),
    [channels],
  )

  const channelFunnels = useMemo(
    () => channels.map(ch => ({
      source: ch.media_source,
      label: getSourceLabel(ch.media_source),
      color: getSourceColor(ch.media_source),
      installs: ch.installs,
      registrations: ch.registrations,
      purchases: ch.purchases,
      convRate: ch.installs > 0 ? Math.round((ch.purchases / ch.installs) * 1000) / 10 : 0,
      cac: ch.cac,
      roas: ch.roas,
    })),
    [channels],
  )

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  if (loading) return <Loading message="Carregando funil de marketing..." size={200} />

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
            <button
              onClick={() => router.push('/dashboard/marketing')}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Funil de Marketing</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversão completa por etapa e canal</p>
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
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === p.value
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Global KPIs */}
        {funnel && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Instalações', value: formatCompact(funnel.installs), icon: Download, gradient: 'from-[#00C977] to-[#00b369]' },
              { label: 'Cadastros', value: formatCompact(funnel.registrations), sub: `${funnel.conversion_rates.install_to_registration}% dos installs`, icon: Users, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Agendamentos', value: formatCompact(funnel.bookings), sub: `${funnel.conversion_rates.registration_to_booking}% dos cadastros`, icon: Target, gradient: 'from-purple-500 to-purple-600' },
              { label: 'Conversão Geral', value: `${funnel.conversion_rates.overall}%`, sub: 'install → pagamento', icon: TrendingUp, gradient: 'from-amber-500 to-amber-600' },
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
                {card.sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {/* Visual Funnel with source filter */}
        {funnel && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-[#252940] dark:text-white">Funil de Conversão</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Instalação → Cadastro → Agendamento → Pagamento</p>
              </div>
              <div className="relative">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg px-3 py-1.5 pr-7 border-0 focus:ring-2 focus:ring-purple-500"
                >
                  {uniqueSources.map(s => (
                    <option key={s} value={s}>{s === 'all' ? 'Todos os canais' : getSourceLabel(s)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Step-down funnel visualization */}
            <div className="space-y-2">
              {funnelSteps.map((step, i) => {
                const maxVal = funnelSteps[0]?.value || 1
                const widthPct = Math.max((step.value / maxVal) * 100, 8)
                const dropoff = i > 0 ? funnelSteps[i - 1].value - step.value : 0
                const dropPct = i > 0 && funnelSteps[i - 1].value > 0
                  ? Math.round((dropoff / funnelSteps[i - 1].value) * 100)
                  : 0

                return (
                  <div key={step.name}>
                    <div className="flex items-center gap-4">
                      <div className="w-28 text-right flex-shrink-0">
                        <span className="text-sm font-medium text-[#252940] dark:text-white">{step.name}</span>
                      </div>
                      <div className="flex-1 relative">
                        <div className="w-full rounded-xl overflow-hidden" style={{ height: 44 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
                            className="h-full rounded-xl flex items-center px-4 relative overflow-hidden"
                            style={{ backgroundColor: FUNNEL_COLORS[i] }}
                          >
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                              }}
                            />
                            <span className="text-sm font-bold text-white drop-shadow-sm relative z-10">
                              {formatCompact(step.value)}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="w-20 text-right flex-shrink-0">
                        {i > 0 ? (
                          <div>
                            <span className={`text-sm font-bold ${
                              step.rate > 30 ? 'text-green-600 dark:text-green-400' :
                              step.rate >= 10 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {step.rate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-gray-400">base</span>
                        )}
                      </div>
                    </div>
                    {/* Dropoff indicator */}
                    {i > 0 && dropoff > 0 && (
                      <div className="flex items-center gap-4 my-0.5">
                        <div className="w-28" />
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 rotate-90" />
                            {formatCompact(dropoff)} saíram ({dropPct}%)
                          </span>
                        </div>
                        <div className="w-20" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {funnel.conversion_rates.overall > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Conversão geral (install → pagamento)</span>
                <span className={`text-lg font-bold ${
                  funnel.conversion_rates.overall > 5 ? 'text-green-600 dark:text-green-400' :
                  funnel.conversion_rates.overall >= 2 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {funnel.conversion_rates.overall}%
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Channel-by-channel funnel mini-cards */}
        {channelFunnels.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Funil por Canal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {channelFunnels.map((ch) => {
                const maxVal = Math.max(ch.installs, 1)
                const steps = [
                  { label: 'Install', value: ch.installs },
                  { label: 'Cadastro', value: ch.registrations },
                  { label: 'Pagamento', value: ch.purchases },
                ]
                return (
                  <motion.div
                    key={ch.source}
                    whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ch.color }}
                      />
                      <span className="text-sm font-semibold text-[#252940] dark:text-white">{ch.label}</span>
                    </div>

                    {/* Mini funnel bars */}
                    <div className="space-y-2 mb-4">
                      {steps.map((s, si) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 text-right">{s.label}</span>
                          <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max((s.value / maxVal) * 100, 3)}%` }}
                              transition={{ duration: 0.5, delay: si * 0.1 }}
                              className="h-full rounded-md"
                              style={{ backgroundColor: ch.color, opacity: 1 - si * 0.2 }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-[#252940] dark:text-white w-8 text-right">
                            {formatCompact(s.value)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Conv.</p>
                        <p className={`text-xs font-bold ${
                          ch.convRate > 5 ? 'text-green-600 dark:text-green-400' :
                          ch.convRate >= 2 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {ch.convRate}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">CAC</p>
                        <p className="text-xs font-bold text-[#252940] dark:text-white">
                          {ch.cac > 0 ? formatCurrency(ch.cac) : '—'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">ROAS</p>
                        <p className={`text-xs font-bold ${ch.roas >= 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {ch.roas > 0 ? `${ch.roas}x` : '—'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* CAC Comparison Chart */}
        {cacChartData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#252940] dark:text-white">CAC por Canal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Custo de Aquisição de Cliente</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cacChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  fontSize={11}
                  tickFormatter={(v) => `R$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'CAC']}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229,231,235,0.5)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="cac" radius={[0, 6, 6, 0]} barSize={28}>
                  {cacChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Attribution over time (installs by day) */}
        {overview && overview.installs_by_day.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#252940] dark:text-white">Atribuição ao Longo do Tempo</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Orgânico vs. Pago por dia</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={overview.installs_by_day}>
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
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="organic" name="Orgânico" stroke="#00C977" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="paid" name="Pago" stroke="#1877F2" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Channels CAC comparison table */}
        {channels.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden"
          >
            <div className="p-5 pb-3">
              <h2 className="text-base font-semibold text-[#252940] dark:text-white">Tabela Comparativa por Canal</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Performance completa de cada canal de aquisição</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['Canal', 'Installs', 'Cadastros', 'Pagamentos', 'Custo', 'Receita', 'CAC', 'ROAS', 'Conv.'].map(label => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {channels.map((ch) => {
                    const conv = ch.installs > 0 ? Math.round((ch.purchases / ch.installs) * 1000) / 10 : 0
                    return (
                      <tr key={ch.media_source} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSourceColor(ch.media_source) }} />
                            <span className="font-medium text-[#252940] dark:text-white">{getSourceLabel(ch.media_source)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#252940] dark:text-white">{ch.installs}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.registrations}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.purchases}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ch.cost > 0 ? formatCurrency(ch.cost) : '—'}</td>
                        <td className="px-4 py-3 font-medium text-[#252940] dark:text-white">{ch.revenue > 0 ? formatCurrency(ch.revenue) : '—'}</td>
                        <td className="px-4 py-3">
                          {ch.cac > 0 ? (
                            <span className={`font-semibold ${ch.cac < 50 ? 'text-green-600 dark:text-green-400' : ch.cac < 100 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(ch.cac)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {ch.roas > 0 ? (
                            <span className={`font-semibold ${ch.roas >= 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {ch.roas}x
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${conv > 5 ? 'text-green-600 dark:text-green-400' : conv >= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                            {conv}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
