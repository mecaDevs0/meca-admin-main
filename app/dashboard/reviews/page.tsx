'use client'

import Pagination from '@/components/ui/Pagination'
import { apiClient } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle, Eye, EyeOff, Filter, MessageSquare, Search,
  Star, X, Image as ImageIcon, BarChart3, TrendingUp,
  ChevronDown, Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Review {
  id: number
  customer_id: number
  workshop_id: number
  booking_id: number | null
  rating: number
  comment: string | null
  quality_rating: number | null
  price_rating: number | null
  time_rating: number | null
  has_photos: boolean
  photo_urls: string[] | null
  hidden_at: string | null
  hidden_reason: string | null
  hidden_by: string | null
  admin_response: string | null
  admin_response_at: string | null
  admin_response_by: string | null
  customer_first_name: string | null
  customer_last_name: string | null
  customer_email: string | null
  customer_phone: string | null
  workshop_name: string | null
  created_at: string
}

interface ReviewPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ReviewStats {
  total: number
  average: number
  distribution: number[]
  respondedPct: number
  hiddenCount: number
}

const STAR_OPTIONS = [
  { value: '', label: 'Todas as notas' },
  { value: '5', label: '5 estrelas' },
  { value: '4', label: '4 estrelas' },
  { value: '3', label: '3 estrelas' },
  { value: '2', label: '2 estrelas' },
  { value: '1', label: '1 estrela' },
]

const VISIBILITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'false', label: 'Visíveis' },
  { value: 'true', label: 'Ocultas' },
  { value: 'no_response', label: 'Sem resposta' },
]

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </span>
  )
}

function PhotoGallery({ photos }: { photos: string[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!photos || photos.length === 0) return null

  return (
    <>
      <div className="flex items-center gap-2 mt-3">
        {photos.slice(0, 4).map((url, i) => (
          <button
            key={i}
            onClick={() => setExpanded(url)}
            className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/20 dark:border-gray-700 hover:border-[#00c977] transition-colors flex-shrink-0"
          >
            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
        {photos.length > 4 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">+{photos.length - 4}</span>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setExpanded(null)}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={expanded}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setExpanded(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

const customerName = (r: Review) => {
  const parts = [r.customer_first_name, r.customer_last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Cliente anônimo'
}

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [workshopSearch, setWorkshopSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [hideDialogOpen, setHideDialogOpen] = useState(false)
  const [respondDialogOpen, setRespondDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [hideReason, setHideReason] = useState('')
  const [responseText, setResponseText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadStats()
  }, [router])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const { data } = await apiClient.getReviews({ page: 1 } as never)
      const body = data as Record<string, unknown>
      const allReviews = Array.isArray(body.data) ? (body.data as Review[]) : []
      const total = (body.pagination as ReviewPagination)?.total ?? allReviews.length

      const distribution = [0, 0, 0, 0, 0]
      let sum = 0
      let respondedCount = 0
      let hiddenCount = 0

      for (const r of allReviews) {
        if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++
        sum += r.rating
        if (r.admin_response) respondedCount++
        if (r.hidden_at) hiddenCount++
      }

      const sampleSize = allReviews.length || 1
      setStats({
        total,
        average: Math.round((sum / sampleSize) * 10) / 10,
        distribution,
        respondedPct: Math.round((respondedCount / sampleSize) * 100),
        hiddenCount,
      })
    } catch { /* silent */ }
    setStatsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => loadReviews(), 400)
    return () => clearTimeout(timer)
  }, [page, ratingFilter, visibilityFilter, dateFrom, dateTo])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)

      const isNoResponse = visibilityFilter === 'no_response'
      const hiddenParam = isNoResponse ? undefined : (visibilityFilter || undefined)

      const { data, error } = await apiClient.getReviews({
        page,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        hidden: hiddenParam,
      })

      if (data && !error) {
        const body = data as Record<string, unknown>
        let list = Array.isArray(body.data) ? (body.data as Review[]) : []
        if (isNoResponse) {
          list = list.filter(r => !r.admin_response)
        }
        setReviews(list)
        setPagination((body.pagination as ReviewPagination) ?? null)
      } else {
        setReviews([])
        setPagination(null)
      }
    } catch {
      setReviews([])
      setPagination(null)
    }
    setLoading(false)
  }, [page, ratingFilter, visibilityFilter, dateFrom, dateTo])

  const handleHide = async () => {
    if (!selectedReview || !hideReason.trim()) return
    setActionLoading(true)
    try {
      await apiClient.hideReview(selectedReview.id, hideReason)
      setHideDialogOpen(false)
      setHideReason('')
      setSelectedReview(null)
      loadReviews()
      loadStats()
    } catch { /* toast fallback */ }
    setActionLoading(false)
  }

  const handleUnhide = async (review: Review) => {
    await apiClient.unhideReview(review.id)
    loadReviews()
    loadStats()
  }

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) return
    setActionLoading(true)
    try {
      await apiClient.respondToReview(selectedReview.id, responseText)
      setRespondDialogOpen(false)
      setResponseText('')
      setSelectedReview(null)
      loadReviews()
      loadStats()
    } catch { /* handled */ }
    setActionLoading(false)
  }

  const clearFilters = () => {
    setRatingFilter('')
    setVisibilityFilter('')
    setWorkshopSearch('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = Boolean(ratingFilter || visibilityFilter || workshopSearch || dateFrom || dateTo)

  const displayedReviews = useMemo(() => {
    if (!workshopSearch.trim()) return reviews
    return reviews.filter(r => r.workshop_name?.toLowerCase().includes(workshopSearch.toLowerCase()))
  }, [reviews, workshopSearch])

  const maxDist = stats ? Math.max(...stats.distribution, 1) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.06 }}
        className="max-w-[1920px] mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Avaliações</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gerenciar reviews de clientes sobre oficinas</p>
          </div>
        </motion.div>

        {/* KPI Cards + Star Distribution */}
        {stats && !statsLoading && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* KPI Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Total de Reviews',
                  value: stats.total,
                  icon: Users,
                  gradient: 'from-yellow-400 to-yellow-500',
                },
                {
                  label: 'Média Geral',
                  value: stats.average > 0 ? stats.average.toFixed(1) : '—',
                  icon: Star,
                  gradient: 'from-[#00c977] to-[#00b369]',
                },
                {
                  label: '% Respondidas',
                  value: `${stats.respondedPct}%`,
                  icon: MessageSquare,
                  gradient: 'from-blue-500 to-blue-600',
                },
                {
                  label: 'Ocultas',
                  value: stats.hiddenCount,
                  icon: EyeOff,
                  gradient: 'from-red-500 to-red-600',
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
                >
                  <div className={`w-9 h-9 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center mb-3`}>
                    <kpi.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-[#252940] dark:text-white">{kpi.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Star Distribution */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-[#252940] dark:text-white">Distribuição</span>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star - 1]
                  const pct = maxDist > 0 ? (count / maxDist) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-4 text-right">{star}</span>
                      <Star size={12} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 2)}%` }}
                          transition={{ duration: 0.5, delay: (5 - star) * 0.08 }}
                          className="h-full rounded-md"
                          style={{
                            backgroundColor: star >= 4 ? '#00C977' : star === 3 ? '#EAB308' : '#EF4444',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#252940] dark:text-white w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm p-4"
        >
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  aria-label="Buscar por oficina"
                  placeholder="Buscar por oficina..."
                  value={workshopSearch}
                  onChange={e => { setWorkshopSearch(e.target.value); setPage(1) }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 dark:text-white text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

              <div className="relative">
                <select
                  aria-label="Filtrar por nota"
                  value={ratingFilter}
                  onChange={e => { setRatingFilter(e.target.value); setPage(1) }}
                  className="appearance-none px-3 py-2 pr-7 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 dark:text-white text-xs font-medium"
                >
                  {STAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  aria-label="Filtrar por visibilidade"
                  value={visibilityFilter}
                  onChange={e => { setVisibilityFilter(e.target.value); setPage(1) }}
                  className="appearance-none px-3 py-2 pr-7 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 dark:text-white text-xs font-medium"
                >
                  {VISIBILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              <input
                type="date"
                aria-label="Data inicial"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 dark:text-white text-xs"
              />
              <span className="text-gray-400 dark:text-gray-500 text-xs">até</span>
              <input
                type="date"
                aria-label="Data final"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c977] focus:border-transparent bg-white dark:bg-gray-900/50 dark:text-white text-xs"
              />

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Review list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-white/20 dark:border-gray-700/50 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : displayedReviews.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm p-8 text-center"
          >
            <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">Nenhuma avaliação encontrada</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Não há avaliações com os filtros selecionados.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {displayedReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border shadow-sm p-5 transition-all ${
                  review.hidden_at
                    ? 'border-red-200 dark:border-red-800/50 opacity-70'
                    : 'border-white/20 dark:border-gray-700/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Review info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Stars count={review.rating} />
                      <span className="text-sm font-semibold text-[#252940] dark:text-white">
                        {customerName(review)}
                      </span>
                      {review.hidden_at && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-semibold border border-red-200 dark:border-red-800">
                          <EyeOff className="w-3 h-3" />
                          Oculta
                        </span>
                      )}
                      {review.has_photos && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-semibold border border-purple-200 dark:border-purple-800">
                          <ImageIcon className="w-3 h-3" />
                          Fotos
                        </span>
                      )}
                      {!review.admin_response && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-amber-800">
                          Sem resposta
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                      {review.comment || <span className="italic text-gray-400 dark:text-gray-500">Sem comentário</span>}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Oficina: <strong className="text-gray-700 dark:text-gray-300">{review.workshop_name || '—'}</strong>
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{formatDateTime(review.created_at)}</span>
                      {review.quality_rating && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span>Qualidade: {review.quality_rating}/5</span>
                        </>
                      )}
                      {review.price_rating && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span>Preço: {review.price_rating}/5</span>
                        </>
                      )}
                      {review.time_rating && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span>Tempo: {review.time_rating}/5</span>
                        </>
                      )}
                    </div>

                    {/* Photo gallery */}
                    {review.photo_urls && review.photo_urls.length > 0 && (
                      <PhotoGallery photos={review.photo_urls} />
                    )}

                    {/* Hidden reason */}
                    {review.hidden_at && review.hidden_reason && (
                      <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-sm">
                        <span className="text-red-600 dark:text-red-400 font-medium">Motivo: </span>
                        <span className="text-red-700 dark:text-red-300">{review.hidden_reason}</span>
                        <span className="text-red-400 dark:text-red-500 text-xs ml-2">por {review.hidden_by}</span>
                      </div>
                    )}

                    {/* Admin response */}
                    {review.admin_response && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Resposta MECA: </span>
                        <span className="text-blue-700 dark:text-blue-300">{review.admin_response}</span>
                        <span className="text-blue-400 dark:text-blue-500 text-xs ml-2">
                          por {review.admin_response_by} em {review.admin_response_at ? formatDateTime(review.admin_response_at) : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                    {!review.admin_response && (
                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setResponseText('')
                          setRespondDialogOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Responder
                      </button>
                    )}

                    {review.hidden_at ? (
                      <button
                        onClick={() => handleUnhide(review)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Mostrar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setHideReason('')
                          setHideDialogOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Ocultar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </motion.div>

      {/* Hide Dialog */}
      <AnimatePresence>
        {hideDialogOpen && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setHideDialogOpen(false); setSelectedReview(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">Ocultar avaliação</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Avaliação de <strong>{customerName(selectedReview)}</strong> ({selectedReview.rating} estrelas) para <strong>{selectedReview.workshop_name}</strong>
              </p>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo *</label>
              <textarea
                value={hideReason}
                onChange={e => setHideReason(e.target.value)}
                placeholder="Explique o motivo para ocultar esta avaliação..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 dark:text-white text-sm resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => { setHideDialogOpen(false); setSelectedReview(null) }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleHide}
                  disabled={!hideReason.trim() || actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Ocultando...' : 'Ocultar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Respond Dialog */}
      <AnimatePresence>
        {respondDialogOpen && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setRespondDialogOpen(false); setSelectedReview(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">Responder como MECA</h3>
              <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Stars count={selectedReview.rating} size={12} />
                  <span className="font-medium text-[#252940] dark:text-white text-xs">{customerName(selectedReview)}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-3">
                  {selectedReview.comment || 'Sem comentário'}
                </p>
              </div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Resposta *</label>
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Digite a resposta oficial da MECA..."
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 dark:text-white text-sm resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => { setRespondDialogOpen(false); setSelectedReview(null) }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRespond}
                  disabled={!responseText.trim() || actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Enviando...' : 'Enviar resposta'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
