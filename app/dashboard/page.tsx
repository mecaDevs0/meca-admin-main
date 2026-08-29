'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'
import { motion } from 'framer-motion'
import {
  Building2, Clock, Users, Bell, Activity, DollarSign,
  Percent, CreditCard, TrendingUp, CheckCircle, CalendarCheck,
  ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardMetrics {
  total_customers: number
  customers_this_week: number
  new_users_this_month: number
  active_customers: number
  total_oficinas: number
  workshops_this_week: number
  new_workshops_this_month: number
  active_workshops: number
  oficinas_by_status: {
    pendente?: number
    aprovado?: number
    rejeitado?: number
  }
  revenue_this_month: number
  meca_take: number
  gateway_fee: number
  meca_revenue: number
  customer_registrations: Array<{ name: string; value: number }>
  workshop_registrations: Array<{ name: string; value: number }>
  total_bookings: number
  bookings_this_month: number
  total_completed_services: number
  completed_services_this_month: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      window.location.replace('/login/')
      return
    }
    apiClient.setToken(token)
    loadMetrics()
  }, [router, period])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getDashboardMetrics(period)

      if (error || !data) {
        showToast.error('Erro ao carregar métricas', error || 'Não foi possível carregar os dados')
        setMetrics(null)
        setLoading(false)
        return
      }

      const rawData = (data as any).data ?? data

      const processChartData = (arr: any[] | undefined): Array<{ name: string; value: number }> => {
        if (!arr || !Array.isArray(arr)) return []
        return arr.map((item: any) => ({
          name: item.name || item.month || 'N/A',
          value: parseInt(item.value || item.count || '0', 10)
        })).filter(item => item.value >= 0)
      }

      setMetrics({
        total_customers: rawData.customers?.total ?? rawData.total_customers ?? 0,
        customers_this_week: rawData.customers?.this_week ?? rawData.customers_this_week ?? 0,
        new_users_this_month: rawData.customers?.this_month ?? rawData.new_users_this_month ?? 0,
        active_customers: rawData.customers?.active ?? rawData.active_customers ?? 0,
        total_oficinas: rawData.workshops?.total ?? rawData.total_oficinas ?? 0,
        workshops_this_week: rawData.workshops?.this_week ?? rawData.workshops_this_week ?? 0,
        new_workshops_this_month: rawData.workshops?.this_month ?? rawData.new_workshops_this_month ?? 0,
        active_workshops: rawData.workshops?.active ?? rawData.active_workshops ?? 0,
        oficinas_by_status: rawData.workshops?.by_status ?? rawData.oficinas_by_status ?? {},
        revenue_this_month: rawData.payments?.revenue_this_month ?? rawData.revenue_this_month ?? 0,
        meca_take: rawData.payments?.meca_take ?? 0,
        gateway_fee: rawData.payments?.gateway_fee ?? rawData.payments?.pagbank_fee ?? 0,
        meca_revenue: rawData.payments?.meca_revenue ?? 0,
        customer_registrations: processChartData(rawData.charts?.customer_registrations ?? rawData.customer_registrations),
        workshop_registrations: processChartData(rawData.charts?.workshop_registrations ?? rawData.workshop_registrations),
        total_bookings: rawData.bookings?.total ?? 0,
        bookings_this_month: rawData.bookings?.this_month ?? 0,
        total_completed_services: rawData.services?.total_completed ?? 0,
        completed_services_this_month: rawData.services?.completed_this_month ?? 0,
      })
    } catch {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setMetrics(null)
    }
    setLoading(false)
  }

  const periodLabel: Record<string, string> = {
    '7d': 'últimos 7 dias',
    '30d': 'últimos 30 dias',
    '90d': 'últimos 90 dias',
    '6m': 'últimos 6 meses',
    '1y': 'último ano',
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  if (loading) return <Loading message="Carregando métricas..." size={200} />

  if (!metrics) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">Não foi possível carregar as métricas</h3>
          <p className="text-gray-600 dark:text-gray-400">Verifique a conexão com a API e tente novamente.</p>
        </div>
      </div>
    )
  }

  const pendingWorkshops = metrics.oficinas_by_status?.pendente || 0
  const completionRate = metrics.total_bookings > 0
    ? ((metrics.total_completed_services / metrics.total_bookings) * 100).toFixed(0)
    : '0'
  const avgTicket = metrics.total_completed_services > 0
    ? metrics.revenue_this_month / metrics.completed_services_this_month || 0
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.06 }}
        className="max-w-[1920px] mx-auto space-y-6"
      >
        {/* Header + Period filter */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visão geral do marketplace MECA</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['7d', '30d', '90d', '6m', '1y'].map((v) => (
              <button
                key={v}
                onClick={() => setPeriod(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === v
                    ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {{ '7d': '7d', '30d': '30d', '90d': '90d', '6m': '6m', '1y': '1 ano' }[v]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Alert: pending workshops */}
        {pendingWorkshops > 0 && (
          <motion.div
            variants={itemVariants}
            onClick={() => router.push('/dashboard/workshops?status=pending')}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors"
          >
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {pendingWorkshops} oficina{pendingWorkshops > 1 ? 's' : ''} aguardando aprovação
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">Clique para revisar</span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500" />
          </motion.div>
        )}

        {/* KPI Row — 6 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Clientes', value: metrics.total_customers, sub: `+${metrics.customers_this_week} ${periodLabel[period] ?? period}`, icon: Users, gradient: 'from-[#00c977] to-[#00b369]' },
            { label: 'Oficinas', value: metrics.total_oficinas, sub: `${metrics.active_workshops} ativas`, icon: Building2, gradient: 'from-[#252940] to-[#1B1D2E]' },
            { label: 'Agendamentos', value: metrics.total_bookings, sub: `${metrics.bookings_this_month} este mês`, icon: CalendarCheck, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Serviços Feitos', value: metrics.total_completed_services, sub: `${metrics.completed_services_this_month} este mês`, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
            { label: 'Taxa Conclusão', value: `${completionRate}%`, sub: 'agendados → concluídos', icon: TrendingUp, gradient: 'from-purple-500 to-purple-600' },
            { label: 'Ticket Médio', value: avgTicket > 0 ? formatCurrency(avgTicket) : '—', sub: 'mês atual', icon: DollarSign, gradient: 'from-amber-500 to-amber-600' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
            >
              <div className={`w-9 h-9 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-3`}>
                <card.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#252940] dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Financial section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Financeiro MECA — Mês Atual</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Receita Bruta */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receita Bruta</p>
              </div>
              <p className="text-2xl font-bold text-[#252940] dark:text-white">{formatCurrency(metrics.revenue_this_month)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Total pagamentos aprovados</p>
            </div>

            {/* Taxa MECA */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-lg flex items-center justify-center">
                  <Percent className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Taxa MECA (12%)</p>
              </div>
              <p className="text-2xl font-bold text-[#252940] dark:text-white">{formatCurrency(metrics.meca_take)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Comissão sobre a receita bruta</p>
            </div>

            {/* Custo Gateway */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Custo Asaas (~3.4%)</p>
              </div>
              <p className="text-2xl font-bold text-[#252940] dark:text-white">{formatCurrency(metrics.gateway_fee)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Taxa do gateway de pagamento</p>
            </div>

            {/* Receita Líquida MECA */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-[#00c977]/30 dark:border-[#00c977]/20 shadow-sm shadow-[#00c977]/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-lg flex items-center justify-center shadow-lg shadow-[#00c977]/30">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Líquido MECA (~8.6%)</p>
              </div>
              <p className="text-2xl font-bold text-[#00c977]">{formatCurrency(metrics.meca_revenue)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Taxa MECA − Custo Asaas</p>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/dashboard/workshops?status=pending')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#252940] dark:text-white">Aprovar Oficinas</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{pendingWorkshops} pendente{pendingWorkshops !== 1 ? 's' : ''}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#252940] dark:text-white">Enviar Notificações</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Push para usuários</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={() => router.push('/dashboard/api-status')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#252940] dark:text-white">Status da API</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Saúde e performance</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <h2 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Cadastro de Clientes (6 meses)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.customer_registrations.length > 0 ? metrics.customer_registrations : [
                { name: 'Jan', value: 0 }, { name: 'Fev', value: 0 }, { name: 'Mar', value: 0 },
                { name: 'Abr', value: 0 }, { name: 'Mai', value: 0 }, { name: 'Jun', value: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="value" name="Clientes" fill="#00c977" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <h2 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Cadastro de Oficinas (6 meses)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.workshop_registrations.length > 0 ? metrics.workshop_registrations : [
                { name: 'Jan', value: 0 }, { name: 'Fev', value: 0 }, { name: 'Mar', value: 0 },
                { name: 'Abr', value: 0 }, { name: 'Mai', value: 0 }, { name: 'Jun', value: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="value" name="Oficinas" fill="#252940" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
