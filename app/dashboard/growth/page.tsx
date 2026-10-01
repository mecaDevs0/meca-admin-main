'use client'

import { apiClient } from '@/lib/api'
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeletons'
import { StatCard } from '@/components/ui/StatCard'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { EmptyState } from '@/components/ui/EmptyState'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'
import {
  Users, UserPlus, TrendingUp, TrendingDown, Activity,
  Eye, ShieldAlert, BarChart3, ArrowDown, ArrowUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface GrowthMetrics {
  wau: number
  mau: number
  dau: number
  retention_d7: number
  retention_d30: number
  churn_rate: number
  churn_rate_workshops: number
  new_customers_trend: Array<{ date: string; value: number }>
  new_workshops_trend: Array<{ date: string; value: number }>
  cohort_data?: Array<{ month: string; m0: number; m1: number; m2: number; m3: number; m4: number; m5: number }>
  top_growing_workshops?: Array<{ id: string; name: string; bookings_growth: number; revenue_growth: number }>
  top_churning_workshops?: Array<{ id: string; name: string; bookings_drop: number; last_booking: string }>
}

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

const COHORT_COLORS = ['#00c977', '#00b369', '#009f5b', '#008a4d', '#00753f', '#006031']

export default function GrowthPage() {
  const router = useRouter()
  const [data, setData] = useState<GrowthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('90d')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { window.location.replace('/login/'); return }
    apiClient.setToken(token)
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    const { data: raw, error } = await apiClient.request<any>(`/admin/analytics/growth?period=${period}`)
    if (raw) {
      const d = raw.data ?? raw
      setData({
        wau: d.wau ?? 0,
        mau: d.mau ?? 0,
        dau: d.dau ?? 0,
        retention_d7: d.retention_d7 ?? d.retention?.d7 ?? 0,
        retention_d30: d.retention_d30 ?? d.retention?.d30 ?? 0,
        churn_rate: d.churn_rate ?? d.churn?.customers ?? 0,
        churn_rate_workshops: d.churn_rate_workshops ?? d.churn?.workshops ?? 0,
        new_customers_trend: d.new_customers_trend ?? d.trends?.customers ?? [],
        new_workshops_trend: d.new_workshops_trend ?? d.trends?.workshops ?? [],
        cohort_data: d.cohort_data ?? d.cohorts ?? [],
        top_growing_workshops: d.top_growing_workshops ?? d.top_growing ?? [],
        top_churning_workshops: d.top_churning_workshops ?? d.top_churning ?? [],
      })
    } else {
      showToast.error('Erro ao carregar growth', error || '')
      setData(null)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-[1920px] mx-auto space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <KpiSkeleton count={5} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton /><ChartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <EmptyState icon={BarChart3} title="Sem dados de Growth" description="O endpoint /admin/analytics/growth não retornou dados." action={{ label: 'Tentar novamente', onClick: loadData }} />
      </div>
    )
  }

  const combinedTrend = data.new_customers_trend.map((c, i) => ({
    date: c.date,
    clientes: c.value,
    oficinas: data.new_workshops_trend[i]?.value ?? 0,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="max-w-[1920px] mx-auto space-y-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1">Growth Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Retenção, churn, cohorts e tendências de crescimento</p>
          </div>
          <DateRangePicker value={period} onChange={(v) => setPeriod(v)} />
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="DAU" value={data.dau} icon={Eye} gradient="from-blue-500 to-blue-600" sub="Ativos diários" />
            <StatCard label="WAU" value={data.wau} icon={Activity} gradient="from-purple-500 to-purple-600" sub="Ativos semanais" />
            <StatCard label="MAU" value={data.mau} icon={Users} gradient="from-[#00c977] to-[#00b369]" sub="Ativos mensais" />
            <StatCard label="Retenção D7" value={`${data.retention_d7.toFixed(1)}%`} icon={UserPlus} gradient="from-green-500 to-green-600" sub="Voltam em 7 dias" />
            <StatCard label="Retenção D30" value={`${data.retention_d30.toFixed(1)}%`} icon={TrendingUp} gradient="from-emerald-500 to-emerald-600" sub="Voltam em 30 dias" />
            <StatCard label="Churn Clientes" value={`${data.churn_rate.toFixed(1)}%`} icon={ShieldAlert} gradient="from-red-500 to-red-600" sub="Taxa mensal" />
          </div>
        </motion.div>

        {/* Trends chart */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
          <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Novos Registros ao Longo do Tempo</h3>
          {combinedTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={combinedTrend}>
                <defs>
                  <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c977" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00c977" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOficinas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#252940" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#252940" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(10px)' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="clientes" name="Clientes" stroke="#00c977" strokeWidth={2} fill="url(#colorClientes)" />
                <Area type="monotone" dataKey="oficinas" name="Oficinas" stroke="#252940" strokeWidth={2} fill="url(#colorOficinas)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados de tendência" icon={TrendingUp} />
          )}
        </motion.div>

        {/* Cohort Heatmap */}
        {data.cohort_data && data.cohort_data.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Tabela de Cohorts — Retenção Mensal</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-left py-2 px-3 font-medium">Cohort</th>
                    <th className="text-center py-2 px-3 font-medium">M0</th>
                    <th className="text-center py-2 px-3 font-medium">M1</th>
                    <th className="text-center py-2 px-3 font-medium">M2</th>
                    <th className="text-center py-2 px-3 font-medium">M3</th>
                    <th className="text-center py-2 px-3 font-medium">M4</th>
                    <th className="text-center py-2 px-3 font-medium">M5</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cohort_data.map((row) => (
                    <tr key={row.month} className="border-t border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 px-3 font-medium text-[#252940] dark:text-white">{row.month}</td>
                      {[row.m0, row.m1, row.m2, row.m3, row.m4, row.m5].map((val, ci) => {
                        const pct = row.m0 > 0 ? (val / row.m0) * 100 : 0
                        const opacity = Math.max(0.1, pct / 100)
                        return (
                          <td key={ci} className="py-2 px-3 text-center">
                            <div
                              className="rounded-lg py-1 px-2 font-semibold"
                              style={{
                                backgroundColor: `rgba(0, 201, 119, ${opacity})`,
                                color: opacity > 0.5 ? '#fff' : '#252940',
                              }}
                            >
                              {ci === 0 ? val : `${pct.toFixed(0)}%`}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Top Growing / Churning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.top_growing_workshops && data.top_growing_workshops.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-green-500" /> Top Oficinas em Crescimento
              </h3>
              <div className="space-y-2">
                {data.top_growing_workshops.map((w, i) => (
                  <button
                    key={w.id}
                    onClick={() => router.push(`/dashboard/workshops/edit/${w.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#252940] dark:text-white truncate">{w.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-500">+{w.bookings_growth}%</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {data.top_churning_workshops && data.top_churning_workshops.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-red-500" /> Oficinas com Queda
              </h3>
              <div className="space-y-2">
                {data.top_churning_workshops.map((w, i) => (
                  <button
                    key={w.id}
                    onClick={() => router.push(`/dashboard/workshops/edit/${w.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#252940] dark:text-white truncate">{w.name}</p>
                      <p className="text-[10px] text-gray-400">Último booking: {w.last_booking}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-500">-{w.bookings_drop}%</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
