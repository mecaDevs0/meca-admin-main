'use client'

import { motion } from 'framer-motion'
import { Users, Building2, RefreshCw, UserCheck, TrendingUp, TrendingDown } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface GrowthTabProps {
  data: any
  loading: boolean
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null
  const pct = (((current - previous) / previous) * 100).toFixed(1)
  const up = current >= previous
  return (
    <span className={`text-xs flex items-center gap-0.5 font-semibold ${up ? 'text-[#00c977]' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}%
    </span>
  )
}

export function GrowthTab({ data, loading }: GrowthTabProps) {
  if (loading || !data) return <div className="flex justify-center py-20 text-gray-400">Carregando...</div>

  const kpis = data.kpis || {}
  const funnel = data.funnel || {}
  const series = data.growth_series || []
  const churn = data.churn || {}

  const funnelMax = Math.max(funnel.registered || 1, 1)
  const funnelSteps = [
    { label: 'Cadastrou', value: funnel.registered || 0, color: '#6366f1' },
    { label: 'Agendou', value: funnel.booked || 0, color: '#3b82f6' },
    { label: 'Pagou', value: funnel.paid || 0, color: '#00c977' },
    { label: 'Concluiu', value: funnel.completed || 0, color: '#10b981' },
  ]

  const churnData = [
    { name: '30 dias', value: churn.inactive_30d || 0 },
    { name: '60 dias', value: churn.inactive_60d || 0 },
    { name: '90 dias', value: churn.inactive_90d || 0 },
  ]

  const kpiCards = [
    { label: 'Novos Clientes', value: kpis.new_customers || 0, prev: kpis.new_customers_prev || 0, icon: Users, color: 'from-[#00c977] to-[#00b369]' },
    { label: 'Novas Oficinas', value: kpis.new_workshops || 0, prev: kpis.new_workshops_prev || 0, icon: Building2, color: 'from-[#252940] to-[#1B1D2E]' },
    { label: 'Clientes Retidos', value: kpis.retained_customers || 0, prev: 0, icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { label: 'Crescimento Total', value: (kpis.new_customers || 0) + (kpis.new_workshops || 0), prev: 0, icon: RefreshCw, color: 'from-yellow-500 to-yellow-600' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-lg"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-[#252940] dark:text-white">{card.value}</p>
              <DeltaBadge current={Number(card.value)} previous={card.prev} />
            </div>
            {card.prev > 0 && <p className="text-xs text-gray-400 mt-1">Anterior: {card.prev}</p>}
          </motion.div>
        ))}
      </div>

      {/* Funil */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
        <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-5">Funil de Conversão</h3>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => {
            const pct = Math.round((step.value / funnelMax) * 100)
            const convRate = i > 0 && funnelSteps[i - 1].value > 0
              ? ((step.value / funnelSteps[i - 1].value) * 100).toFixed(0)
              : null
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#252940] dark:text-white">{step.label}</span>
                  <div className="flex items-center gap-3">
                    {convRate && <span className="text-xs text-gray-400">{convRate}% do anterior</span>}
                    <span className="text-sm font-bold" style={{ color: step.color }}>{step.value}</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Crescimento Acumulado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
              <YAxis fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,30,0.95)', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="customers" name="Clientes" stroke="#00c977" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="workshops" name="Oficinas" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Oficinas Inativas (Churn)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,30,0.95)', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" name="Oficinas inativas" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
