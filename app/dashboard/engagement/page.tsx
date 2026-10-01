'use client'

import { apiClient } from '@/lib/api'
import { KpiSkeleton, CardSkeleton } from '@/components/ui/Skeletons'
import { EmptyState } from '@/components/ui/EmptyState'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'
import {
  Heart, RefreshCw, Star, Bell, Users,
  Play, AlertCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

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

interface EngagementData {
  loyalty: LoyaltyStats | null
  reactivation: ReactivationStats | null
  reactivationError: boolean
  reviewIncentives: ReviewIncentiveStats | null
  maintenance: MaintenanceStats | null
}

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

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

export default function EngagementPage() {
  const [data, setData] = useState<EngagementData>({
    loyalty: null,
    reactivation: null,
    reactivationError: false,
    reviewIncentives: null,
    maintenance: null,
  })
  const [loading, setLoading] = useState(true)
  const [processingLoyalty, setProcessingLoyalty] = useState(false)
  const [processingReview, setProcessingReview] = useState(false)
  const [processingMaintenance, setProcessingMaintenance] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { window.location.replace('/login/'); return }
    apiClient.setToken(token)
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [loyaltyRes, reactivationRes, reviewRes, maintenanceRes] = await Promise.all([
      apiClient.request<any>('/admin/loyalty/stats').catch(() => ({ data: null })),
      apiClient.request<any>('/admin/reactivation/stats').catch(() => ({ data: null, error: 'unavailable' })),
      apiClient.request<any>('/admin/review-incentives/stats').catch(() => ({ data: null })),
      apiClient.request<any>('/admin/maintenance-reminders/stats').catch(() => ({ data: null })),
    ])

    const parseLoyalty = (raw: any): LoyaltyStats | null => {
      if (!raw) return null
      const d = raw.data ?? raw
      if (d.active_members === undefined) return null
      return d
    }

    const parseReactivation = (raw: any): { stats: ReactivationStats | null; error: boolean } => {
      if (!raw || raw.error) return { stats: null, error: true }
      const d = raw.data ?? raw
      if (d.total_sent === undefined) return { stats: null, error: true }
      return { stats: d, error: false }
    }

    const parseReview = (raw: any): ReviewIncentiveStats | null => {
      if (!raw) return null
      const d = raw.data ?? raw
      if (d.total_pushes === undefined) return null
      return d
    }

    const parseMaintenance = (raw: any): MaintenanceStats | null => {
      if (!raw) return null
      const d = raw.data ?? raw
      if (d.total_sent === undefined) return null
      return d
    }

    const reactivation = parseReactivation(reactivationRes)

    setData({
      loyalty: parseLoyalty(loyaltyRes),
      reactivation: reactivation.stats,
      reactivationError: reactivation.error,
      reviewIncentives: parseReview(reviewRes),
      maintenance: parseMaintenance(maintenanceRes),
    })
    setLoading(false)
  }

  const processLoyalty = async () => {
    setProcessingLoyalty(true)
    const { error } = await apiClient.request('/admin/loyalty/send-reminders', { method: 'POST' })
    if (error) showToast.error('Erro', error)
    else showToast.success('Sucesso', 'Lembretes de fidelidade enviados')
    setProcessingLoyalty(false)
    loadAll()
  }

  const processReviewIncentives = async () => {
    setProcessingReview(true)
    const { error } = await apiClient.request('/admin/review-incentives/process', { method: 'POST' })
    if (error) showToast.error('Erro', error)
    else showToast.success('Sucesso', 'Incentivos de review processados')
    setProcessingReview(false)
    loadAll()
  }

  const processMaintenance = async () => {
    setProcessingMaintenance(true)
    const { error } = await apiClient.request('/admin/maintenance-reminders/process', { method: 'POST' })
    if (error) showToast.error('Erro', error)
    else showToast.success('Sucesso', 'Lembretes de manutenção processados')
    setProcessingMaintenance(false)
    loadAll()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-[1920px] mx-auto space-y-6">
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
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
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1">Programas de Engajamento</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fidelidade, reativação, incentivos de review e manutenção preventiva</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgramCard
            title="Programa de Fidelidade"
            description="Pontos e recompensas por uso recorrente"
            icon={Heart}
            gradient="from-pink-500 to-rose-600"
            stats={[
              { label: 'Participantes', value: data.loyalty?.active_members ?? '—' },
              { label: 'Resgates', value: data.loyalty?.total_redemptions ?? '—' },
              { label: 'Pts Resgatados', value: data.loyalty?.total_points_redeemed ?? '—' },
            ]}
            actionLabel="Enviar Lembretes"
            onAction={processLoyalty}
            loading={processingLoyalty}
          />

          <ProgramCard
            title="Reativação de Inativos"
            description="Clientes que não agendaram nos últimos 60 dias"
            icon={RefreshCw}
            gradient="from-amber-500 to-orange-600"
            unavailable={data.reactivationError && !data.reactivation}
            stats={[
              { label: 'Enviados', value: data.reactivation?.total_sent ?? '—' },
              { label: 'Utilizados', value: data.reactivation?.total_used ?? '—' },
              { label: 'Conversão', value: data.reactivation?.conversion_rate != null ? `${data.reactivation.conversion_rate.toFixed(1)}%` : '—' },
            ]}
          />

          <ProgramCard
            title="Incentivo de Reviews"
            description="Estimular clientes a avaliar após o serviço"
            icon={Star}
            gradient="from-yellow-500 to-amber-600"
            stats={[
              { label: 'Enviados', value: data.reviewIncentives?.total_pushes ?? '—' },
              { label: 'Reviews', value: data.reviewIncentives?.reviews_received ?? '—' },
              { label: 'Conversão', value: data.reviewIncentives?.conversion_rate != null ? `${data.reviewIncentives.conversion_rate.toFixed(1)}%` : '—' },
            ]}
            actionLabel="Processar"
            onAction={processReviewIncentives}
            loading={processingReview}
          />

          <ProgramCard
            title="Lembretes de Manutenção"
            description="Avisar clientes sobre manutenções preventivas"
            icon={Bell}
            gradient="from-blue-500 to-indigo-600"
            stats={[
              { label: 'Enviados', value: data.maintenance?.total_sent ?? '—' },
              { label: 'Convertidos', value: data.maintenance?.conversions ?? '—' },
              { label: 'Taxa', value: data.maintenance?.conversion_rate != null ? `${data.maintenance.conversion_rate.toFixed(1)}%` : '—' },
            ]}
            actionLabel="Processar"
            onAction={processMaintenance}
            loading={processingMaintenance}
          />
        </div>
      </motion.div>
    </div>
  )
}
