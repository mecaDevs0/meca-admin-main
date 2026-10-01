'use client'

import { apiClient } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { KpiSkeleton, TableSkeleton } from '@/components/ui/Skeletons'
import { EmptyState } from '@/components/ui/EmptyState'
import { showToast } from '@/lib/toast'
import { formatPhone, formatCnpj } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Building2, Mail, MapPin, Phone, Star, Calendar,
  CreditCard, Users, Image, Wrench, FileText, TrendingUp,
  ExternalLink, Clock, CheckCircle, XCircle, AlertTriangle,
  DollarSign, Eye, EyeOff, MessageSquare, Edit, ChevronRight,
  BarChart3, Receipt, UserCheck, Camera, Globe, Shield,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense, useCallback, useMemo } from 'react'

interface Workshop {
  id: string
  name: string
  email: string
  phone?: string
  cnpj?: string
  address?: string
  city?: string
  state?: string
  cep?: string
  status?: string
  description?: string
  logo_url?: string | null
  facade_url?: string | null
  rating?: number
  total_reviews?: number
  meca_fee_percentage?: number | null
  referral_code?: string | null
  referred_by_name?: string | null
  is_fee_reduced?: boolean
  fee_reduced_until?: string | null
  active_referrals_count?: number
  owner_name?: string | null
  completed_services_count?: number
  total_bookings_count?: number
  created_at?: string
  workshop_payment_provider?: string | null
  asaas_account_id?: string | null
  asaas_wallet_id?: string | null
  asaas_status?: string | null
  asaas_pix_key?: string | null
  asaas_pix_key_type?: string | null
  bank_name?: string | null
  bank_code?: string | null
  agency?: string | null
  account?: string | null
  account_type?: string | null
  pix_key?: string | null
  pix_key_type?: string | null
  auto_anticipation_enabled?: boolean
}

interface Booking {
  id: string
  customer_name?: string
  vehicle_plate?: string
  vehicle_model?: string
  status: string
  appointment_date?: string
  final_price?: number
  total_amount?: number
  created_at: string
}

interface Review {
  id: string
  customer_name?: string
  rating: number
  comment?: string
  is_hidden?: boolean
  admin_response?: string
  created_at: string
  photos?: string[]
}

interface Service {
  id: string
  name: string
  price?: number
  duration?: number
  description?: string
  is_active?: boolean
}

interface GalleryPhoto {
  id: string
  url: string
  caption?: string
  created_at: string
}

interface Employee {
  id: string
  name: string
  email?: string
  role?: string
  status?: string
  created_at: string
}

interface FinancialData {
  total_revenue?: number
  total_meca_fees?: number
  total_workshop_amount?: number
  total_payments?: number
  pending_payments?: number
}

const TABS = [
  { key: 'perfil', label: 'Perfil', icon: Building2 },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'servicos', label: 'Serviços', icon: Wrench },
  { key: 'galeria', label: 'Galeria', icon: Image },
  { key: 'equipe', label: 'Equipe', icon: Users },
] as const

type TabKey = typeof TABS[number]['key']

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Aprovada', color: '#00C977', bg: 'rgba(0,201,119,0.12)' },
  aprovado: { label: 'Aprovada', color: '#00C977', bg: 'rgba(0,201,119,0.12)' },
  pending: { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  pendente: { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  rejected: { label: 'Rejeitada', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  rejeitado: { label: 'Rejeitada', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  disabled: { label: 'Desativada', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
}

const BOOKING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: '#F59E0B' },
  ACCEPTED: { label: 'Aceito', color: '#3B82F6' },
  CHECKIN: { label: 'Check-in', color: '#8B5CF6' },
  IN_PROGRESS: { label: 'Em andamento', color: '#3B82F6' },
  AWAITING_PAYMENT: { label: 'Aguardando pgto', color: '#F59E0B' },
  COMPLETED: { label: 'Concluído', color: '#00C977' },
  CANCELLED: { label: 'Cancelado', color: '#EF4444' },
  REJECTED: { label: 'Rejeitado', color: '#EF4444' },
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 30) return `${diffDays}d atrás`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m atrás`
  return `${Math.floor(diffDays / 365)}a atrás`
}

const itemVariants = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }

function ProfileTab({ workshop }: { workshop: Workshop }) {
  const status = STATUS_MAP[(workshop.status ?? 'pending').toLowerCase()] ?? STATUS_MAP.pending

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.04 }} className="space-y-5">
      {/* Header card */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-700">
            {workshop.logo_url && workshop.logo_url.startsWith('http') ? (
              <img src={workshop.logo_url} alt={workshop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#252940] to-[#1B1D2E] flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-[#252940] dark:text-white">{workshop.name}</h2>
                {workshop.owner_name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Resp: {workshop.owner_name}</p>
                )}
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                {status.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {workshop.email && (
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{workshop.email}</span>
              )}
              {workshop.phone && (
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{formatPhone(workshop.phone)}</span>
              )}
              {workshop.cnpj && (
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{formatCnpj(workshop.cnpj)}</span>
              )}
            </div>
            {(workshop.address || workshop.city) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {[workshop.address, workshop.city, workshop.state].filter(Boolean).join(', ')}
                {workshop.cep && ` - ${workshop.cep}`}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rating" value={workshop.rating?.toFixed(1) ?? '—'} icon={Star} gradient="from-yellow-500 to-amber-600" sub={`${workshop.total_reviews ?? 0} reviews`} />
        <StatCard label="Bookings" value={workshop.total_bookings_count ?? workshop.completed_services_count ?? 0} icon={Calendar} gradient="from-blue-500 to-blue-600" sub="total" />
        <StatCard label="Cadastro" value={formatDate(workshop.created_at)} icon={Clock} gradient="from-gray-500 to-gray-600" sub={workshop.created_at ? formatRelative(workshop.created_at) : ''} />
        <StatCard label="Indicações" value={workshop.active_referrals_count ?? 0} icon={Users} gradient="from-purple-500 to-purple-600" sub={workshop.referral_code ?? '—'} />
      </motion.div>

      {/* Description */}
      {workshop.description && (
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
          <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-2">Descrição</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{workshop.description}</p>
        </motion.div>
      )}

      {/* Payment provider + Asaas */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
        <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Provedor de Pagamento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Provedor</span>
            <p className="mt-1 font-medium text-[#252940] dark:text-white capitalize">{workshop.workshop_payment_provider ?? 'asaas'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status Asaas</span>
            <p className="mt-1">
              {workshop.asaas_status ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  ['ACTIVE', 'APPROVED'].includes(workshop.asaas_status.toUpperCase())
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}>
                  {workshop.asaas_status}
                </span>
              ) : <span className="text-gray-400">—</span>}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Account ID</span>
            <p className="mt-1 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">{workshop.asaas_account_id || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Wallet ID</span>
            <p className="mt-1 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">{workshop.asaas_wallet_id || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">PIX</span>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {workshop.asaas_pix_key || workshop.pix_key || '—'}
              {(workshop.asaas_pix_key_type || workshop.pix_key_type) && (
                <span className="text-xs text-gray-400 ml-1">({workshop.asaas_pix_key_type || workshop.pix_key_type})</span>
              )}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Antecipação</span>
            <p className="mt-1">
              <span className={`text-xs font-semibold ${workshop.auto_anticipation_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {workshop.auto_anticipation_enabled ? 'Ativa' : 'Inativa'}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Banking */}
      {(workshop.bank_name || workshop.agency || workshop.account) && (
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
          <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Dados Bancários
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Banco</span>
              <p className="mt-1 text-[#252940] dark:text-white">{workshop.bank_name || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Agência</span>
              <p className="mt-1 text-[#252940] dark:text-white">{workshop.agency || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Conta</span>
              <p className="mt-1 text-[#252940] dark:text-white">{workshop.account || '—'} {workshop.account_type && `(${workshop.account_type})`}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Chave PIX</span>
              <p className="mt-1 text-[#252940] dark:text-white break-all">{workshop.pix_key || '—'}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Referral program */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
        <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Indique e Ganhe
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Código</span>
            <p className="mt-1 font-mono font-semibold text-[#252940] dark:text-white">{workshop.referral_code || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Indicada por</span>
            <p className="mt-1 text-[#252940] dark:text-white">{workshop.referred_by_name || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Indicações</span>
            <p className="mt-1 text-[#252940] dark:text-white">{workshop.active_referrals_count ?? 0} / 5</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Taxa reduzida</span>
            <p className="mt-1">
              <span className={`text-xs font-semibold ${workshop.is_fee_reduced ? 'text-green-600' : 'text-gray-400'}`}>
                {workshop.is_fee_reduced ? 'Ativa' : 'Inativa'}
              </span>
              {workshop.fee_reduced_until && (
                <span className="text-xs text-gray-400 ml-1">até {formatDate(workshop.fee_reduced_until)}</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FinancialTab({ workshopId }: { workshopId: string }) {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: res } = await apiClient.request<any>(`/workshop/${workshopId}/financial-summary`)
      if (res) {
        const d = res.data ?? res
        setData(d)
      }
      setLoading(false)
    })()
  }, [workshopId])

  if (loading) return <KpiSkeleton count={4} />

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.04 }} className="space-y-5">
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Faturamento" value={formatCurrency(data?.total_revenue)} icon={DollarSign} gradient="from-[#00c977] to-[#00b369]" sub="total" />
        <StatCard label="Taxa MECA" value={formatCurrency(data?.total_meca_fees)} icon={Receipt} gradient="from-[#252940] to-[#1B1D2E]" sub="retido" />
        <StatCard label="Líquido Oficina" value={formatCurrency(data?.total_workshop_amount)} icon={TrendingUp} gradient="from-blue-500 to-blue-600" sub="repassado" />
        <StatCard label="Pagamentos" value={data?.total_payments ?? 0} icon={CreditCard} gradient="from-purple-500 to-purple-600" sub={data?.pending_payments ? `${data.pending_payments} pendentes` : 'confirmados'} />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm text-center">
        <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gráficos detalhados de faturamento estarão disponíveis em breve.
        </p>
      </motion.div>
    </motion.div>
  )
}

function BookingsTab({ workshopId }: { workshopId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: res } = await apiClient.request<any>(`/workshop/${workshopId}/bookings`)
      if (res) {
        const raw = res.data ?? res
        const list = raw.bookings ?? raw.appointments ?? (Array.isArray(raw) ? raw : [])
        setBookings(list)
      }
      setLoading(false)
    })()
  }, [workshopId])

  if (loading) return <TableSkeleton rows={6} cols={5} />

  if (bookings.length === 0) {
    return <EmptyState icon={Calendar} title="Nenhum booking" description="Esta oficina ainda não recebeu agendamentos." />
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.03 }} className="space-y-4">
      <motion.div variants={itemVariants} className="text-sm text-gray-500 dark:text-gray-400">
        {bookings.length} agendamento{bookings.length !== 1 ? 's' : ''} encontrado{bookings.length !== 1 ? 's' : ''}
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Veículo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Valor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 50).map((b, i) => {
                const st = BOOKING_STATUS_MAP[b.status] ?? { label: b.status, color: '#6B7280' }
                return (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#252940] dark:text-white">{b.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {b.vehicle_plate && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 font-mono mr-1">
                          {b.vehicle_plate}
                        </span>
                      )}
                      {b.vehicle_model || ''}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: `${st.color}18`, color: st.color }}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: st.color }} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      {b.total_amount != null ? formatCurrency(b.total_amount) : b.final_price != null ? formatCurrency(b.final_price / 100) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(b.appointment_date || b.created_at)}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ReviewsTab({ workshopId }: { workshopId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: res } = await apiClient.request<any>(`/reviews/workshop/${workshopId}`)
      if (res) {
        const raw = res.data ?? res
        const list = raw.reviews ?? (Array.isArray(raw) ? raw : [])
        setReviews(list)
      }
      setLoading(false)
    })()
  }, [workshopId])

  if (loading) return <KpiSkeleton count={3} />

  if (reviews.length === 0) {
    return <EmptyState icon={Star} title="Nenhuma avaliação" description="Esta oficina ainda não recebeu avaliações de clientes." />
  }

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.04 }} className="space-y-4">
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <StatCard label="Nota Média" value={avgRating.toFixed(1)} icon={Star} gradient="from-yellow-500 to-amber-600" sub={`${reviews.length} avaliações`} />
        <StatCard label="5 Estrelas" value={reviews.filter(r => r.rating === 5).length} icon={Star} gradient="from-[#00c977] to-[#00b369]" sub={`${((reviews.filter(r => r.rating === 5).length / reviews.length) * 100).toFixed(0)}%`} />
        <StatCard label="Ocultas" value={reviews.filter(r => r.is_hidden).length} icon={EyeOff} gradient="from-gray-500 to-gray-600" sub="moderadas" />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        {reviews.slice(0, 30).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border shadow-sm ${
              r.is_hidden ? 'border-red-200/50 dark:border-red-800/30 opacity-60' : 'border-white/20 dark:border-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-[#252940] dark:text-white">{r.customer_name || 'Cliente'}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3 h-3" style={{ color: j < r.rating ? '#FBBF24' : '#D1D5DB', fill: j < r.rating ? '#FBBF24' : 'none' }} />
                    ))}
                  </div>
                  {r.is_hidden && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold">Oculta</span>
                  )}
                </div>
                {r.comment && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{r.comment}</p>}
                {r.admin_response && (
                  <div className="mt-2 pl-3 border-l-2 border-[#00C977]/30">
                    <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold text-[#00C977]">Resposta:</span> {r.admin_response}</p>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{formatDate(r.created_at)}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function ServicesTab({ workshopId }: { workshopId: string }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: res } = await apiClient.request<any>(`/workshop/${workshopId}/services`)
      if (res) {
        const raw = res.data ?? res
        const list = raw.services ?? (Array.isArray(raw) ? raw : [])
        setServices(list)
      }
      setLoading(false)
    })()
  }, [workshopId])

  if (loading) return <TableSkeleton rows={4} cols={3} />

  if (services.length === 0) {
    return <EmptyState icon={Wrench} title="Nenhum serviço" description="Esta oficina ainda não cadastrou serviços." />
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.03 }} className="space-y-3">
      {services.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c977]/15 to-[#00c977]/5 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-[#00c977]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#252940] dark:text-white">{s.name}</p>
            {s.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.description}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            {s.price != null && <p className="text-sm font-semibold text-[#252940] dark:text-white">{formatCurrency(s.price / 100)}</p>}
            {s.duration != null && <p className="text-[10px] text-gray-400">{s.duration} min</p>}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function GalleryTab({ workshopId }: { workshopId: string }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: res } = await apiClient.request<any>(`/workshop/${workshopId}/gallery`)
      if (res) {
        const raw = res.data ?? res
        const list = raw.photos ?? raw.gallery ?? (Array.isArray(raw) ? raw : [])
        setPhotos(list)
      }
      setLoading(false)
    })()
  }, [workshopId])

  if (loading) return <KpiSkeleton count={6} />

  if (photos.length === 0) {
    return <EmptyState icon={Camera} title="Galeria vazia" description="Esta oficina ainda não adicionou fotos à galeria." />
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.04 }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((p, i) => (
          <motion.div
            key={p.id}
            variants={itemVariants}
            className="aspect-square rounded-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 shadow-sm group relative"
          >
            <img src={p.url} alt={p.caption || 'Galeria'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {p.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{p.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function TeamTab({ workshopId }: { workshopId: string }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: res } = await apiClient.request<any>(`/workshop/${workshopId}/employees`)
      if (res) {
        const raw = res.data ?? res
        const list = raw.employees ?? (Array.isArray(raw) ? raw : [])
        setEmployees(list)
      }
      setLoading(false)
    })()
  }, [workshopId])

  if (loading) return <TableSkeleton rows={3} cols={3} />

  if (employees.length === 0) {
    return <EmptyState icon={Users} title="Nenhum funcionário" description="Esta oficina ainda não cadastrou membros da equipe." />
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.04 }} className="space-y-3">
      {employees.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#252940] to-[#1B1D2E] flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#252940] dark:text-white">{e.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {e.email && <span>{e.email}</span>}
              {e.role && <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-medium">{e.role}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {e.status && (
              <span className={`text-[10px] font-semibold ${e.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                {e.status === 'active' ? 'Ativo' : e.status}
              </span>
            )}
            <p className="text-[10px] text-gray-400">{formatDate(e.created_at)}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function WorkshopDetailInner({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get('tab')
    return (TABS.find(tab => tab.key === t)?.key ?? 'perfil') as TabKey
  })

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { window.location.replace('/login/'); return }
    apiClient.setToken(token)
    loadWorkshop()
  }, [id])

  const loadWorkshop = async () => {
    setLoading(true)
    const { data: res, error } = await apiClient.request<any>(`/admin/workshops/${id}`)
    if (res) {
      const raw = res.data ?? res
      const ws = raw.workshop ?? raw.oficina ?? raw
      setWorkshop(ws)
    } else {
      showToast.error('Erro', error || 'Não foi possível carregar a oficina')
    }
    setLoading(false)
  }

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
    const params = new URLSearchParams(window.location.search)
    if (tab !== 'perfil') params.set('tab', tab); else params.delete('tab')
    router.replace(`?${params}`, { scroll: false })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-[1920px] mx-auto">
          <KpiSkeleton count={4} />
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6">
        <EmptyState icon={Building2} title="Oficina não encontrada" description="Ela pode ter sido removida." action={{ label: 'Voltar', onClick: () => router.push('/dashboard/workshops') }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="max-w-[1920px] mx-auto space-y-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/workshops')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-[#00c977] transition-colors text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Oficinas
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">{workshop.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visão 360° da oficina</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/workshops/edit/index?id=${workshop.id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#00c977] to-[#00b369] hover:shadow-lg hover:shadow-[#00c977]/20 transition-all"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </motion.div>

        {/* Tab bar */}
        <motion.div variants={itemVariants} className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === key
                  ? 'bg-[#00c977] text-white shadow-lg shadow-[#00c977]/20'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#00c977]/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'perfil' && <ProfileTab workshop={workshop} />}
            {activeTab === 'financeiro' && <FinancialTab workshopId={workshop.id} />}
            {activeTab === 'bookings' && <BookingsTab workshopId={workshop.id} />}
            {activeTab === 'reviews' && <ReviewsTab workshopId={workshop.id} />}
            {activeTab === 'servicos' && <ServicesTab workshopId={workshop.id} />}
            {activeTab === 'galeria' && <GalleryTab workshopId={workshop.id} />}
            {activeTab === 'equipe' && <TeamTab workshopId={workshop.id} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function PageClient({ id }: { id: string }) {
  return (
    <Suspense>
      <WorkshopDetailInner id={id} />
    </Suspense>
  )
}
