'use client'

import { apiClient } from '@/lib/api'
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeletons'
import { StatCard } from '@/components/ui/StatCard'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { EmptyState } from '@/components/ui/EmptyState'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'
import {
  Users, UserPlus, TrendingUp, Activity,
  ShieldAlert, BarChart3, Clock,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell,
} from 'recharts'

interface GrowthData {
  kpis: {
    new_customers: number
    new_customers_prev: number
    new_workshops: number
    new_workshops_prev: number
    retained_customers: number
  }
  funnel: {
    registered: number
    booked: number
    paid: number
    completed: number
  }
  growth_series: Array<{ date: string; customers: number; workshops: number }>
  churn: {
    inactive_30d: number
    inactive_60d: number
    inactive_90d: number
  }
}

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

function calcDelta(current: number, prev: number): number | undefined {
  if (prev === 0 && current === 0) return undefined
  if (prev === 0) return 100
  return ((current - prev) / prev) * 100
}

export default function GrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null)
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
        kpis: {
          new_customers: d.kpis?.new_customers ?? 0,
          new_customers_prev: d.kpis?.new_customers_prev ?? 0,
          new_workshops: d.kpis?.new_workshops ?? 0,
          new_workshops_prev: d.kpis?.new_workshops_prev ?? 0,
          retained_customers: d.kpis?.retained_customers ?? 0,
        },
        funnel: {
          registered: d.funnel?.registered ?? 0,
          booked: d.funnel?.booked ?? 0,
          paid: d.funnel?.paid ?? 0,
          completed: d.funnel?.completed ?? 0,
        },
        growth_series: d.growth_series ?? [],
        churn: {
          inactive_30d: d.churn?.inactive_30d ?? 0,
          inactive_60d: d.churn?.inactive_60d ?? 0,
          inactive_90d: d.churn?.inactive_90d ?? 0,
        },
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

  const { kpis, funnel, growth_series, churn } = data

  const customerDelta = calcDelta(kpis.new_customers, kpis.new_customers_prev)
  const workshopDelta = calcDelta(kpis.new_workshops, kpis.new_workshops_prev)

  const funnelSteps = [
    { name: 'Cadastrados', value: funnel.registered, color: '#00C977' },
    { name: 'Agendaram', value: funnel.booked, color: '#3B82F6' },
    { name: 'Pagaram', value: funnel.paid, color: '#8B5CF6' },
    { name: 'Concluíram', value: funnel.completed, color: '#F59E0B' },
  ]

  const churnData = [
    { label: '30 dias', value: churn.inactive_30d, color: '#F59E0B' },
    { label: '60 dias', value: churn.inactive_60d, color: '#F97316' },
    { label: '90 dias', value: churn.inactive_90d, color: '#EF4444' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="max-w-[1920px] mx-auto space-y-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1">Growth Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Crescimento, funil de conversão e churn</p>
          </div>
          <DateRangePicker value={period} onChange={(v) => setPeriod(v)} />
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              label="Novos Clientes"
              value={kpis.new_customers}
              icon={UserPlus}
              gradient="from-[#00c977] to-[#00b369]"
              sub={`vs. ${kpis.new_customers_prev} período anterior`}
              delta={customerDelta}
            />
            <StatCard
              label="Novas Oficinas"
              value={kpis.new_workshops}
              icon={Activity}
              gradient="from-purple-500 to-purple-600"
              sub={`vs. ${kpis.new_workshops_prev} período anterior`}
              delta={workshopDelta}
            />
            <StatCard
              label="Clientes Retidos"
              value={kpis.retained_customers}
              icon={Users}
              gradient="from-blue-500 to-blue-600"
              sub="Voltaram no período"
            />
            <StatCard
              label="Inativos 30d"
              value={churn.inactive_30d}
              icon={Clock}
              gradient="from-amber-500 to-amber-600"
              sub="Sem atividade há 30 dias"
            />
            <StatCard
              label="Inativos 90d"
              value={churn.inactive_90d}
              icon={ShieldAlert}
              gradient="from-red-500 to-red-600"
              sub="Sem atividade há 90 dias"
            />
          </div>
        </motion.div>

        {/* Growth Trends Chart */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
          <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Crescimento ao Longo do Tempo</h3>
          {growth_series.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={growth_series}>
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
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(v) => {
                    const d = new Date(v)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  labelFormatter={(v) => new Date(String(v)).toLocaleDateString('pt-BR')}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="customers" name="Clientes" stroke="#00c977" strokeWidth={2} fill="url(#colorClientes)" />
                <Area type="monotone" dataKey="workshops" name="Oficinas" stroke="#252940" strokeWidth={2} fill="url(#colorOficinas)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados de tendência" description="Dados de crescimento temporal ainda não disponíveis para este período." icon={TrendingUp} />
          )}
        </motion.div>

        {/* Bottom row: Funnel + Churn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conversion Funnel */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Funil de Conversão</h3>
            <div className="space-y-3">
              {funnelSteps.map((step, i) => {
                const maxVal = Math.max(funnelSteps[0].value, 1)
                const widthPct = Math.max((step.value / maxVal) * 100, 6)
                const prevVal = i > 0 ? funnelSteps[i - 1].value : 0
                const convRate = i > 0 && prevVal > 0 ? ((step.value / prevVal) * 100).toFixed(1) : null

                return (
                  <div key={step.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#252940] dark:text-white">{step.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#252940] dark:text-white">{step.value}</span>
                        {convRate && (
                          <span className="text-[10px] text-gray-400">({convRate}%)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: step.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            {funnel.registered > 0 && funnel.completed > 0 && (
              <p className="text-[11px] text-gray-400 mt-4 text-right">
                Conversão geral: <span className="font-semibold text-[#252940] dark:text-white">
                  {((funnel.completed / funnel.registered) * 100).toFixed(1)}%
                </span>
              </p>
            )}
          </motion.div>

          {/* Churn Breakdown */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Clientes Inativos (Churn)</h3>
            {churn.inactive_30d === 0 && churn.inactive_60d === 0 && churn.inactive_90d === 0 ? (
              <EmptyState title="Sem dados de churn" description="Nenhum cliente inativo encontrado neste período." icon={ShieldAlert} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={churnData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} horizontal={false} />
                    <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                    <YAxis type="category" dataKey="label" stroke="#9ca3af" fontSize={12} width={65} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                      formatter={(value) => [`${value} clientes`, 'Inativos']}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                      {churnData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  {churnData.map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-[10px] text-gray-400">Inativos {item.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
