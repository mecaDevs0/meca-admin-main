'use client'

import { apiClient } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { KpiSkeleton, ChartSkeleton, TableSkeleton, CardSkeleton } from '@/components/ui/Skeletons'
import { EmptyState } from '@/components/ui/EmptyState'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'
import {
  Building2, Clock, Users, Bell, Activity, DollarSign,
  Percent, CreditCard, TrendingUp, CheckCircle, CalendarCheck,
  ArrowRight, AlertTriangle, Star, MessageSquare, Receipt,
  BarChart3, Zap, Eye, UserPlus, ShieldAlert, RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

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

interface GrowthData {
  wau?: number
  mau?: number
  retention_d7?: number
  retention_d30?: number
  churn_rate?: number
}

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PIE_COLORS = ['#00c977', '#252940', '#EF4444']

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [growth, setGrowth] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [customFrom, setCustomFrom] = useState<string>()
  const [customTo, setCustomTo] = useState<string>()
  const [reviewStats, setReviewStats] = useState<{ total: number; unanswered: number; avgRating: number }>({ total: 0, unanswered: 0, avgRating: 0 })
  const [invoiceErrors, setInvoiceErrors] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      window.location.replace('/login/')
      return
    }
    apiClient.setToken(token)
    loadAll()
  }, [period, customFrom, customTo])

  const loadAll = useCallback(async () => {
    setLoading(true)
    const effectivePeriod = period === 'custom' && customFrom && customTo
      ? `custom&from=${customFrom}&to=${customTo}`
      : period

    const [metricsRes, growthRes, reviewsRes, invoicesRes] = await Promise.all([
      apiClient.getDashboardMetrics(effectivePeriod),
      apiClient.request<any>('/admin/analytics/growth').catch(() => ({ data: null })),
      apiClient.request<any>('/admin/reviews?limit=1').catch(() => ({ data: null })),
      apiClient.request<any>('/admin/invoices?status=ERROR&limit=1').catch(() => ({ data: null })),
    ])

    if (metricsRes.data) {
      const rawData = (metricsRes.data as any).data ?? metricsRes.data

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
    } else {
      showToast.error('Erro ao carregar métricas', metricsRes.error || '')
    }

    if (growthRes.data) {
      const gd = (growthRes.data as any).data ?? growthRes.data
      setGrowth(gd)
    }

    if (reviewsRes.data) {
      const rd = (reviewsRes.data as any)
      setReviewStats({
        total: rd.total ?? 0,
        unanswered: rd.unanswered ?? 0,
        avgRating: rd.averageRating ?? rd.average_rating ?? 0,
      })
    }

    if (invoicesRes.data) {
      const id = (invoicesRes.data as any)
      setInvoiceErrors(id.total ?? 0)
    }

    setLoading(false)
  }, [period, customFrom, customTo])

  const handlePeriodChange = (value: string, from?: string, to?: string) => {
    setPeriod(value)
    if (from && to) { setCustomFrom(from); setCustomTo(to) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-[1920px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
          <KpiSkeleton count={6} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton /><ChartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar as métricas"
          description="Verifique a conexão com a API e tente novamente."
          action={{ label: 'Tentar novamente', onClick: loadAll }}
        />
      </div>
    )
  }

  const pendingWorkshops = metrics.oficinas_by_status?.pendente || 0
  const completionRate = metrics.total_bookings > 0
    ? ((metrics.total_completed_services / metrics.total_bookings) * 100)
    : 0
  const avgTicket = metrics.completed_services_this_month > 0
    ? metrics.revenue_this_month / metrics.completed_services_this_month
    : 0

  const urgentActions = [
    pendingWorkshops > 0 && { label: 'Oficinas pendentes', count: pendingWorkshops, icon: Clock, color: 'amber', path: '/dashboard/workshops?status=pending' },
    reviewStats.unanswered > 0 && { label: 'Reviews sem resposta', count: reviewStats.unanswered, icon: MessageSquare, color: 'blue', path: '/dashboard/reviews' },
    invoiceErrors > 0 && { label: 'NFs com erro', count: invoiceErrors, icon: Receipt, color: 'red', path: '/dashboard/invoices?status=ERROR' },
  ].filter(Boolean) as Array<{ label: string; count: number; icon: any; color: string; path: string }>

  const workshopStatusData = [
    { name: 'Aprovadas', value: metrics.oficinas_by_status?.aprovado || 0 },
    { name: 'Pendentes', value: metrics.oficinas_by_status?.pendente || 0 },
    { name: 'Rejeitadas', value: metrics.oficinas_by_status?.rejeitado || 0 },
  ].filter(d => d.value > 0)

  const customerSpark = metrics.customer_registrations.map((d) => d.value)
  const workshopSpark = metrics.workshop_registrations.map((d) => d.value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.05 }}
        className="max-w-[1920px] mx-auto space-y-5"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cockpit executivo — MECA Marketplace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker value={period} onChange={handlePeriodChange} />
            <button
              onClick={loadAll}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-[#00c977] transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Urgent Actions Banner */}
        {urgentActions.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {urgentActions.map((a) => {
              const colorMap: Record<string, string> = {
                amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300',
                blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300',
                red: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300',
              }
              return (
                <button
                  key={a.label}
                  onClick={() => router.push(a.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all hover:shadow-md ${colorMap[a.color]}`}
                >
                  <a.icon className="w-4 h-4" />
                  <span>{a.count} {a.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-60" />
                </button>
              )
            })}
          </motion.div>
        )}

        {/* KPI Row */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <StatCard
              label="Clientes"
              value={metrics.total_customers}
              sub={`+${metrics.new_users_this_month} este mês`}
              icon={Users}
              gradient="from-[#00c977] to-[#00b369]"
              sparkData={customerSpark}
              onClick={() => router.push('/dashboard/users')}
            />
            <StatCard
              label="Oficinas"
              value={metrics.total_oficinas}
              sub={`${metrics.active_workshops} ativas`}
              icon={Building2}
              gradient="from-[#252940] to-[#1B1D2E]"
              sparkData={workshopSpark}
              onClick={() => router.push('/dashboard/workshops')}
            />
            <StatCard
              label="Agendamentos"
              value={metrics.total_bookings}
              sub={`${metrics.bookings_this_month} este mês`}
              icon={CalendarCheck}
              gradient="from-blue-500 to-blue-600"
              onClick={() => router.push('/dashboard/bookings')}
            />
            <StatCard
              label="Serviços Feitos"
              value={metrics.total_completed_services}
              sub={`${metrics.completed_services_this_month} este mês`}
              icon={CheckCircle}
              gradient="from-green-500 to-green-600"
            />
            <StatCard
              label="Taxa Conclusão"
              value={`${completionRate.toFixed(0)}%`}
              sub="agendados → concluídos"
              icon={TrendingUp}
              gradient="from-purple-500 to-purple-600"
            />
            <StatCard
              label="Ticket Médio"
              value={avgTicket > 0 ? formatCurrency(avgTicket) : '—'}
              sub="mês atual"
              icon={DollarSign}
              gradient="from-amber-500 to-amber-600"
            />
          </div>
        </motion.div>

        {/* Financial Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Financeiro MECA — Período Selecionado
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Receita Bruta</p>
              </div>
              <p className="text-xl font-bold text-[#252940] dark:text-white">{formatCurrency(metrics.revenue_this_month)}</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-lg flex items-center justify-center">
                  <Percent className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Taxa MECA (12%)</p>
              </div>
              <p className="text-xl font-bold text-[#252940] dark:text-white">{formatCurrency(metrics.meca_take)}</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Custo Asaas (~3.4%)</p>
              </div>
              <p className="text-xl font-bold text-[#252940] dark:text-white">{formatCurrency(metrics.gateway_fee)}</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-[#00c977]/30 dark:border-[#00c977]/20 shadow-sm shadow-[#00c977]/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-lg flex items-center justify-center shadow-lg shadow-[#00c977]/30">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Líquido MECA</p>
              </div>
              <p className="text-xl font-bold text-[#00c977]">{formatCurrency(metrics.meca_revenue)}</p>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Customer registrations */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm lg:col-span-1"
          >
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Cadastro de Clientes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.customer_registrations.length > 0 ? metrics.customer_registrations : [{ name: '-', value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(229,231,235,0.5)', borderRadius: '12px', padding: '8px 12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Clientes" fill="#00c977" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workshop registrations */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm lg:col-span-1"
          >
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Cadastro de Oficinas</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.workshop_registrations.length > 0 ? metrics.workshop_registrations : [{ name: '-', value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(229,231,235,0.5)', borderRadius: '12px', padding: '8px 12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Oficinas" fill="#252940" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workshop status pie */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm lg:col-span-1"
          >
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-4">Status das Oficinas</h3>
            {workshopStatusData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={workshopStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {workshopStatusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {workshopStatusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{d.name}</span>
                      <span className="text-xs font-bold text-[#252940] dark:text-white ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="Sem dados" icon={Building2} />
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Aprovar Oficinas', sub: `${pendingWorkshops} pendente${pendingWorkshops !== 1 ? 's' : ''}`, icon: Clock, gradient: 'from-yellow-500 to-yellow-600', path: '/dashboard/workshops?status=pending' },
              { label: 'Enviar Push', sub: 'Campanhas e notificações', icon: Bell, gradient: 'from-blue-500 to-blue-600', path: '/dashboard/campaigns' },
              { label: 'Growth Analytics', sub: 'Retenção e cohorts', icon: BarChart3, gradient: 'from-purple-500 to-purple-600', path: '/dashboard/growth' },
              { label: 'Status API', sub: 'Saúde e performance', icon: Activity, gradient: 'from-gray-500 to-gray-600', path: '/dashboard/api-status' },
            ].map((qa) => (
              <motion.button
                key={qa.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(qa.path)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${qa.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <qa.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#252940] dark:text-white">{qa.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{qa.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Growth Snapshot (if data available) */}
        {growth && (
          <motion.div variants={itemVariants}>
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Snapshot de Growth
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'WAU', value: growth.wau ?? 0, icon: Eye },
                { label: 'MAU', value: growth.mau ?? 0, icon: Users },
                { label: 'Retenção D7', value: growth.retention_d7 ? `${growth.retention_d7.toFixed(1)}%` : '—', icon: UserPlus },
                { label: 'Retenção D30', value: growth.retention_d30 ? `${growth.retention_d30.toFixed(1)}%` : '—', icon: TrendingUp },
                { label: 'Churn Rate', value: growth.churn_rate ? `${growth.churn_rate.toFixed(1)}%` : '—', icon: ShieldAlert },
              ].map((g) => (
                <div
                  key={g.label}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
                >
                  <g.icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-lg font-bold text-[#252940] dark:text-white">{g.value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{g.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
