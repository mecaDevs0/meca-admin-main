'use client'

import { apiClient } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'
import { FileText, DollarSign, TrendingUp, CreditCard, ShoppingBag, Percent } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface FinancialAnalytics {
  kpis: {
    revenue_total: number
    meca_take: number
    meca_revenue: number
    avg_ticket: number
    paid_bookings: number
    conversion_rate: number
  }
  timeseries: Array<{ date: string; revenue: number; meca_revenue: number }>
  top_workshops: Array<{
    id: string
    name: string
    bookings: number
    revenue: number
    meca_commission: number
    avg_ticket: number
  }>
}

type Period = '7d' | '30d' | '90d'

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
}

export default function ReportsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('30d')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    apiClient.setToken(token)
  }, [router])

  useEffect(() => {
    loadAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        router.push('/login')
        return
      }
      apiClient.setToken(token)
      const { data, error } = await apiClient.getFinancialAnalytics(period)
      if (data && !error) {
        const raw = (data as any).data ?? data
        setAnalytics(raw)
      } else {
        console.error('Erro ao carregar analytics:', error)
      }
    } catch (e) {
      console.error('Erro na requisição de analytics:', e)
    }
    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  const kpiCards = analytics
    ? [
        {
          label: 'Receita Total',
          value: formatCurrency(analytics.kpis.revenue_total),
          icon: DollarSign,
          gradient: 'from-[#00c977] to-[#00b369]',
        },
        {
          label: 'Taxa MECA (bruta)',
          value: formatCurrency(analytics.kpis.meca_take),
          icon: CreditCard,
          gradient: 'from-[#252940] to-[#1B1D2E]',
        },
        {
          label: 'Receita Líquida MECA',
          value: formatCurrency(analytics.kpis.meca_revenue),
          icon: TrendingUp,
          gradient: 'from-[#00c977] to-[#009955]',
          glow: true,
        },
        {
          label: 'Ticket Médio',
          value: formatCurrency(analytics.kpis.avg_ticket),
          icon: ShoppingBag,
          gradient: 'from-blue-500 to-blue-600',
        },
        {
          label: 'Bookings Pagos',
          value: String(analytics.kpis.paid_bookings),
          icon: FileText,
          gradient: 'from-purple-500 to-purple-600',
        },
        {
          label: 'Taxa de Conversão',
          value: `${(analytics.kpis.conversion_rate * 100).toFixed(1)}%`,
          icon: Percent,
          gradient: 'from-yellow-500 to-yellow-600',
        },
      ]
    : []

  const topWorkshops = analytics
    ? [...analytics.top_workshops].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    : []

  if (loading) {
    return <Loading message="Carregando relatórios..." size={200} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">
                  Relatórios Financeiros
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receita, comissões e performance da plataforma
                </p>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-1 border border-white/20 dark:border-gray-700/50 shadow">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === p
                      ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-[#252940] dark:hover:text-white'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        {analytics && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
          >
            {kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-lg ${
                    card.glow ? 'ring-1 ring-[#00c977]/30' : ''
                  }`}
                >
                  <div className="mb-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 leading-tight">
                    {card.label}
                  </h3>
                  <p className="text-xl font-bold text-[#252940] dark:text-white break-all">
                    {card.value}
                  </p>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Time Series Chart */}
        {analytics && analytics.timeseries && analytics.timeseries.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
          >
            <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-6">
              Evolução de Receita
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={analytics.timeseries.map((d) => ({
                  ...d,
                  dateFormatted: formatDate(d.date),
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis
                  dataKey="dateFormatted"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      style: 'currency',
                      currency: 'BRL',
                    }).format(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f9fafb',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'revenue' ? 'Receita Bruta' : 'Receita MECA',
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00c977"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#00c977' }}
                />
                <Line
                  type="monotone"
                  dataKey="meca_revenue"
                  stroke="#252940"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#252940' }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4 justify-center">
              <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-6 h-0.5 bg-[#00c977] inline-block rounded" />
                Receita Bruta
              </span>
              <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-6 h-0.5 bg-[#252940] dark:bg-gray-300 inline-block rounded border-dashed" />
                Receita MECA
              </span>
            </div>
          </motion.div>
        )}

        {/* Top Workshops Table */}
        {analytics && topWorkshops.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold text-[#252940] dark:text-white">
                Top {topWorkshops.length} Oficinas por Receita
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Periodo: {PERIOD_LABELS[period]}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Pos.
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Oficina
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Bookings
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Receita
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Comissao MECA
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                      Ticket Medio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkshops.map((w, index) => (
                    <tr
                      key={w.id}
                      className="border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : index === 1
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              : index === 2
                              ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#252940] dark:text-white">
                          {w.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {w.bookings}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-[#00c977]">
                          {formatCurrency(w.revenue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatCurrency(w.meca_commission)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatCurrency(w.avg_ticket)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty state when no data */}
        {!analytics && !loading && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-12 border border-white/20 dark:border-gray-700/50 shadow-lg text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">
              Nenhum dado disponivel
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nao foi possivel carregar os dados financeiros. Tente novamente.
            </p>
            <button
              onClick={loadAnalytics}
              className="mt-4 bg-gradient-to-r from-[#00c977] to-[#00b369] text-white px-6 py-2 rounded-xl text-sm font-medium hover:from-[#00b369] hover:to-[#00a05a] transition-all shadow-lg"
            >
              Tentar novamente
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
