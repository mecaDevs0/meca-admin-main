'use client'

import { apiClient } from '@/lib/api'
import { KpiSkeleton, CardSkeleton } from '@/components/ui/Skeletons'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'
import {
  Heart, RefreshCw, Star, Bell, Users, Target,
  Play, AlertCircle, TrendingUp, BarChart3, Filter,
} from 'lucide-react'
import React, { useEffect, useState, Component } from 'react'

class EngagementErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-xl">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erro no Engajamento</h2>
            <pre className="text-xs text-red-600 dark:text-red-300 whitespace-pre-wrap break-all">{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

interface LoyaltyStats {
  active_members: number
  total_points_outstanding: number
  total_points_ever_earned: number
  total_points_redeemed: number
  total_redemptions: number
}

interface ReactivationStats {
  total_sent: number
  total_used: number
  conversion_rate: number
}

interface ReviewIncentiveStats {
  total_pushes: number
  reviews_received: number
  conversion_rate: number
}

interface MaintenanceStats {
  total_sent: number
  conversions: number
  conversion_rate: number
}

interface OverviewData {
  active_customers: number
  active_workshops: number
  recurrence_rate: number
  recurring_customers: number
  avg_rating: number
  total_reviews: number
  total_bookings: number
}

interface CohortRow {
  month: string
  registered: number
  m0: number
  m1: number
  m2: number
  m3: number
  m4: number
  m5: number
}

interface FunnelStep {
  name: string
  count: number
  rate?: number
}

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

const PERIODS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: 'all', label: 'Todos' },
]

interface ProgramCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  stats: Array<{ label: string; value: string | number }>
  actionLabel?: string
  onAction?: () => void
  loading?: boolean
  unavailable?: boolean
}

function ProgramCard({ title, description, icon: Icon, gradient, stats, actionLabel, onAction, loading, unavailable }: ProgramCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white">{title}</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#00c977] to-[#00b369] rounded-lg hover:shadow-lg hover:shadow-[#00c977]/20 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {actionLabel}
          </button>
        )}
      </div>
      {unavailable ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">Dados temporariamente indisponíveis</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold text-[#252940] dark:text-white">{s.value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function CohortHeatmap({ cohorts }: { cohorts: CohortRow[] }) {
  if (cohorts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">Sem dados de coorte ainda</p>
      </div>
    )
  }

  const getColor = (pct: number) => {
    if (pct >= 50) return 'bg-[#00c977] text-white'
    if (pct >= 30) return 'bg-[#00c977]/70 text-white'
    if (pct >= 15) return 'bg-[#00c977]/40 text-[#252940] dark:text-white'
    if (pct > 0) return 'bg-[#00c977]/20 text-[#252940] dark:text-gray-300'
    return 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
  }

  const months = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5']

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Coorte</th>
            <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Cadastros</th>
            {months.map(m => (
              <th key={m} className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map(c => {
            const vals = [c.m0, c.m1, c.m2, c.m3, c.m4, c.m5]
            return (
              <tr key={c.month} className="border-t border-gray-100 dark:border-gray-700/30">
                <td className="py-2 px-3 font-medium text-[#252940] dark:text-white whitespace-nowrap">{c.month}</td>
                <td className="text-center py-2 px-2 font-semibold text-[#252940] dark:text-white">{c.registered}</td>
                {vals.map((v, i) => {
                  const pct = c.registered > 0 ? Math.round((v / c.registered) * 100) : 0
                  return (
                    <td key={i} className="text-center py-1.5 px-1">
                      <span className={`inline-block min-w-[40px] px-2 py-1 rounded-md text-[10px] font-semibold ${getColor(pct)}`}>
                        {pct}%
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  if (steps.length === 0) return null
  const maxCount = Math.max(...steps.map(s => s.count), 1)

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const widthPct = Math.max((step.count / maxCount) * 100, 8)
        return (
          <div key={step.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#252940] dark:text-white">{step.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#252940] dark:text-white">{step.count}</span>
                {step.rate !== undefined && i > 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    step.rate >= 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : step.rate >= 20 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {step.rate}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="h-full rounded-lg bg-gradient-to-r from-[#00c977] to-[#00b369]"
                style={{ opacity: 1 - i * 0.15 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EngagementPageContent() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [overviewError, setOverviewError] = useState(false)
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [loyalty, setLoyalty] = useState<LoyaltyStats | null>(null)
  const [reactivation, setReactivation] = useState<ReactivationStats | null>(null)
  const [reactivationError, setReactivationError] = useState(false)
  const [reviewIncentives, setReviewIncentives] = useState<ReviewIncentiveStats | null>(null)
  const [maintenance, setMaintenance] = useState<MaintenanceStats | null>(null)

  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [processingLoyalty, setProcessingLoyalty] = useState(false)
  const [processingReview, setProcessingReview] = useState(false)
  const [processingMaintenance, setProcessingMaintenance] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { window.location.replace('/login/'); return }
    apiClient.setToken(token)
  }, [])

  useEffect(() => {
    loadAll()
  }, [period])

  const loadAll = async () => {
    setLoading(true)
    setOverviewError(false)
    setReactivationError(false)

    const results = await Promise.allSettled([
      apiClient.request<any>(`/admin/engagement/overview?period=${period}`),
      apiClient.request<any>(`/admin/engagement/cohort?months=6`),
      apiClient.request<any>(`/admin/engagement/funnel?period=${period}`),
      apiClient.request<any>('/admin/loyalty/stats'),
      apiClient.request<any>('/admin/reactivation/stats'),
      apiClient.request<any>('/admin/review-incentives/stats'),
      apiClient.request<any>('/admin/maintenance-reminders/stats'),
    ])

    // Overview
    if (results[0].status === 'fulfilled') {
      const r = results[0].value
      const d = r?.data ?? r
      if (d && d.active_customers !== undefined) {
        setOverview(d)
      } else {
        setOverviewError(true)
      }
    } else {
      setOverviewError(true)
    }

    // Cohort
    if (results[1].status === 'fulfilled') {
      const r = results[1].value
      const d = r?.data ?? r
      setCohorts(Array.isArray(d?.cohorts) ? d.cohorts : [])
    }

    // Funnel
    if (results[2].status === 'fulfilled') {
      const r = results[2].value
      const d = r?.data ?? r
      setFunnel(Array.isArray(d?.steps) ? d.steps : [])
    }

    // Loyalty
    if (results[3].status === 'fulfilled') {
      const r = results[3].value
      const d = r?.data ?? r
      setLoyalty(d?.active_members !== undefined ? d : null)
    }

    // Reactivation
    if (results[4].status === 'fulfilled') {
      const r = results[4].value
      const d = r?.data ?? r
      if (d?.total_sent !== undefined) {
        setReactivation(d)
      } else {
        setReactivationError(true)
      }
    } else {
      setReactivationError(true)
    }

    // Review incentives
    if (results[5].status === 'fulfilled') {
      const r = results[5].value
      const d = r?.data ?? r
      setReviewIncentives(d?.total_pushes !== undefined ? d : null)
    }

    // Maintenance
    if (results[6].status === 'fulfilled') {
      const r = results[6].value
      const d = r?.data ?? r
      setMaintenance(d?.total_sent !== undefined ? d : null)
    }

    setLoading(false)
  }

  const processLoyalty = async () => {
    setProcessingLoyalty(true)
    try {
      const { error } = await apiClient.request('/admin/loyalty/send-reminders', { method: 'POST' })
      if (error) showToast.error('Erro', error)
      else showToast.success('Sucesso', 'Lembretes de fidelidade enviados')
    } catch { showToast.error('Erro', 'Falha ao processar') }
    setProcessingLoyalty(false)
    loadAll()
  }

  const processReviewIncentives = async () => {
    setProcessingReview(true)
    try {
      const { error } = await apiClient.request('/admin/review-incentives/process', { method: 'POST' })
      if (error) showToast.error('Erro', error)
      else showToast.success('Sucesso', 'Incentivos de review processados')
    } catch { showToast.error('Erro', 'Falha ao processar') }
    setProcessingReview(false)
    loadAll()
  }

  const processMaintenance = async () => {
    setProcessingMaintenance(true)
    try {
      const { error } = await apiClient.request('/admin/maintenance-reminders/process', { method: 'POST' })
      if (error) showToast.error('Erro', error)
      else showToast.success('Sucesso', 'Lembretes de manutenção processados')
    } catch { showToast.error('Erro', 'Falha ao processar') }
    setProcessingMaintenance(false)
    loadAll()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-[1920px] mx-auto space-y-6">
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <KpiSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.06 }} className="max-w-[1920px] mx-auto space-y-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Engajamento</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Métricas, retenção e programas de growth</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.value
                    ? 'bg-[#00c977] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* KPIs */}
        {overview ? (
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Clientes Ativos', value: overview.active_customers, icon: Users, gradient: 'from-[#00c977] to-[#00b369]' },
              { label: 'Oficinas Ativas', value: overview.active_workshops, icon: Target, gradient: 'from-purple-500 to-purple-600' },
              { label: 'Recorrência', value: `${overview.recurrence_rate}%`, icon: RefreshCw, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Avaliação Média', value: overview.avg_rating > 0 ? `${overview.avg_rating} ★` : '—', icon: Star, gradient: 'from-amber-500 to-amber-600' },
            ].map(kpi => (
              <div
                key={kpi.label}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
              >
                <div className={`w-9 h-9 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-[#252940] dark:text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </motion.div>
        ) : overviewError ? (
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">KPIs temporariamente indisponíveis</p>
            </div>
          </motion.div>
        ) : null}

        {/* Cohort + Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#00c977]" />
              <h2 className="text-sm font-semibold text-[#252940] dark:text-white">Retenção por Coorte</h2>
            </div>
            <CohortHeatmap cohorts={cohorts} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#00c977]" />
              <h2 className="text-sm font-semibold text-[#252940] dark:text-white">Funil de Conversão</h2>
            </div>
            {funnel.length > 0 ? (
              <FunnelChart steps={funnel} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-400 dark:text-gray-500">Sem dados de funil ainda</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Growth Programs */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-3">Programas de Growth</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgramCard
            title="Programa de Fidelidade"
            description="Pontos e recompensas por uso recorrente"
            icon={Heart}
            gradient="from-pink-500 to-rose-600"
            stats={[
              { label: 'Participantes', value: loyalty?.active_members ?? '—' },
              { label: 'Resgates', value: loyalty?.total_redemptions ?? '—' },
              { label: 'Pts Resgatados', value: loyalty?.total_points_redeemed ?? '—' },
            ]}
            actionLabel="Enviar Lembretes"
            onAction={processLoyalty}
            loading={processingLoyalty}
            unavailable={!loyalty}
          />

          <ProgramCard
            title="Reativação de Inativos"
            description="Clientes que não agendaram nos últimos 60 dias"
            icon={RefreshCw}
            gradient="from-amber-500 to-orange-600"
            unavailable={reactivationError && !reactivation}
            stats={[
              { label: 'Enviados', value: reactivation?.total_sent ?? '—' },
              { label: 'Utilizados', value: reactivation?.total_used ?? '—' },
              { label: 'Conversão', value: reactivation?.conversion_rate != null ? `${Number(reactivation.conversion_rate).toFixed(1)}%` : '—' },
            ]}
          />

          <ProgramCard
            title="Incentivo de Reviews"
            description="Estimular clientes a avaliar após o serviço"
            icon={Star}
            gradient="from-yellow-500 to-amber-600"
            stats={[
              { label: 'Enviados', value: reviewIncentives?.total_pushes ?? '—' },
              { label: 'Reviews', value: reviewIncentives?.reviews_received ?? '—' },
              { label: 'Conversão', value: reviewIncentives?.conversion_rate != null ? `${Number(reviewIncentives.conversion_rate).toFixed(1)}%` : '—' },
            ]}
            actionLabel="Processar"
            onAction={processReviewIncentives}
            loading={processingReview}
            unavailable={!reviewIncentives}
          />

          <ProgramCard
            title="Lembretes de Manutenção"
            description="Avisar clientes sobre manutenções preventivas"
            icon={Bell}
            gradient="from-blue-500 to-indigo-600"
            stats={[
              { label: 'Enviados', value: maintenance?.total_sent ?? '—' },
              { label: 'Convertidos', value: maintenance?.conversions ?? '—' },
              { label: 'Taxa', value: maintenance?.conversion_rate != null ? `${Number(maintenance.conversion_rate).toFixed(1)}%` : '—' },
            ]}
            actionLabel="Processar"
            onAction={processMaintenance}
            loading={processingMaintenance}
            unavailable={!maintenance}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default function EngagementPage() {
  return (
    <EngagementErrorBoundary>
      <EngagementPageContent />
    </EngagementErrorBoundary>
  )
}
