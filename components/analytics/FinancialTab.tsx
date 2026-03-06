'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, ShoppingCart, Percent } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

interface FinancialTabProps {
  data: any
  loading: boolean
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function FinancialTab({ data, loading }: FinancialTabProps) {
  if (loading || !data) return <div className="flex justify-center py-20 text-gray-400">Carregando...</div>

  const kpis = data.kpis || {}
  const series = data.chart_series || []
  const workshops = data.top_workshops || []

  const kpiCards = [
    { label: 'Receita Total', value: fmt(kpis.revenue_total || 0), icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { label: 'Receita Líquida MECA', value: fmt(kpis.meca_revenue || 0), icon: TrendingUp, color: 'from-[#00c977] to-[#00b369]' },
    { label: 'Ticket Médio', value: fmt(kpis.avg_ticket || 0), icon: ShoppingCart, color: 'from-purple-500 to-purple-600' },
    { label: 'Conversão', value: `${kpis.conversion_rate || 0}%`, icon: Percent, color: 'from-yellow-500 to-yellow-600',
      sub: `${kpis.paid_bookings || 0} agendamentos pagos` },
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
            <p className="text-xl font-bold text-[#252940] dark:text-white">{card.value}</p>
            {'sub' in card && card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
        <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Evolução da Receita</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMeca" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c977" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c977" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
            <YAxis fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15,20,30,0.95)', border: 'none', borderRadius: '12px', color: '#fff' }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            />
            <Area type="monotone" dataKey="revenue" name="Receita Bruta" stroke="#6366f1" fill="url(#gradRevenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="meca_revenue" name="Receita MECA" stroke="#00c977" fill="url(#gradMeca)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Workshops Table */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-[#252940] dark:text-white">Top 10 Oficinas por Receita</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                {['#', 'Oficina', 'Agendamentos', 'Receita', 'Comissão MECA', 'Ticket Médio'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {workshops.map((w: any, i: number) => (
                <tr key={w.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3 text-lg">{MEDAL[i] || `#${i + 1}`}</td>
                  <td className="px-5 py-3 text-sm font-medium text-[#252940] dark:text-white">{w.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{w.bookings}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-[#252940] dark:text-white">{fmt(w.revenue)}</td>
                  <td className="px-5 py-3 text-sm text-[#00c977]">{fmt(w.meca_commission)}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{fmt(w.avg_ticket)}</td>
                </tr>
              ))}
              {workshops.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Nenhum dado para o período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
