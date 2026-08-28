'use client'

import Pagination from '@/components/ui/Pagination'
import { apiClient } from '@/lib/api'
import {
  AlertCircle, Eye, EyeOff, Filter, MessageSquare, Search, Star, X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  hidden_at: string | null
  hidden_reason: string | null
  hidden_by: string | null
  admin_response: string | null
  admin_response_at: string | null
  admin_response_by: string | null
  customer_first_name: string | null
  customer_last_name: string | null
  customer_email: string | null
  workshop_name: string | null
  created_at: string
}

interface ReviewPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STAR_OPTIONS = [
  { value: '', label: 'Todas as notas' },
  { value: '5', label: '5 estrelas' },
  { value: '4', label: '4 estrelas' },
  { value: '3', label: '3 estrelas' },
  { value: '2', label: '2 estrelas' },
  { value: '1', label: '1 estrela' },
]

const HIDDEN_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'false', label: 'Visíveis' },
  { value: 'true', label: 'Ocultas' },
]

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </span>
  )
}

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState('')
  const [hiddenFilter, setHiddenFilter] = useState('')
  const [workshopSearch, setWorkshopSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)

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
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviews()
    }, 400)
    return () => clearTimeout(timer)
  }, [page, ratingFilter, hiddenFilter, dateFrom, dateTo])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      const { data, error } = await apiClient.getReviews({
        page,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        hidden: hiddenFilter || undefined,
      })
      if (data && !error) {
        const body = data as Record<string, unknown>
        setReviews(Array.isArray(body.data) ? body.data as Review[] : [])
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
  }

  const handleHide = async () => {
    if (!selectedReview || !hideReason.trim()) return
    setActionLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      await apiClient.hideReview(selectedReview.id, hideReason)
      setHideDialogOpen(false)
      setHideReason('')
      setSelectedReview(null)
      loadReviews()
    } catch { /* toast fallback */ }
    setActionLoading(false)
  }

  const handleUnhide = async (review: Review) => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) return
    apiClient.setToken(token)
    await apiClient.unhideReview(review.id)
    loadReviews()
  }

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) return
    setActionLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      await apiClient.respondToReview(selectedReview.id, responseText)
      setRespondDialogOpen(false)
      setResponseText('')
      setSelectedReview(null)
      loadReviews()
    } catch { /* handled */ }
    setActionLoading(false)
  }

  const clearFilters = () => {
    setRatingFilter('')
    setHiddenFilter('')
    setWorkshopSearch('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = Boolean(ratingFilter || hiddenFilter || workshopSearch || dateFrom || dateTo)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const customerName = (r: Review) => {
    const parts = [r.customer_first_name, r.customer_last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Cliente anônimo'
  }

  const displayedReviews = workshopSearch.trim()
    ? reviews.filter(r => r.workshop_name?.toLowerCase().includes(workshopSearch.toLowerCase()))
    : reviews

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Avaliações</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciar avaliações de clientes sobre oficinas</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  aria-label="Buscar por oficina"
                  placeholder="Buscar por oficina..."
                  value={workshopSearch}
                  onChange={e => { setWorkshopSearch(e.target.value); setPage(1) }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <select
                aria-label="Filtrar por nota"
                value={ratingFilter}
                onChange={e => { setRatingFilter(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              >
                {STAR_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Filtrar por visibilidade"
                value={hiddenFilter}
                onChange={e => { setHiddenFilter(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              >
                {HIDDEN_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Data inicial"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              />
              <span className="text-gray-400 dark:text-gray-500 text-sm">até</span>
              <input
                type="date"
                aria-label="Data final"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white text-sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma avaliação encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400">Não há avaliações com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedReviews.map(review => (
              <div
                key={review.id}
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border shadow-lg p-5 transition-all ${
                  review.hidden_at
                    ? 'border-red-200 dark:border-red-800/50 opacity-70'
                    : 'border-white/20 dark:border-gray-700/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: review info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Stars count={review.rating} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {customerName(review)}
                      </span>
                      {review.hidden_at && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
                          <EyeOff className="w-3 h-3" />
                          Oculta
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {review.comment || <span className="italic text-gray-400 dark:text-gray-500">Sem comentário</span>}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Oficina: <strong className="text-gray-700 dark:text-gray-300">{review.workshop_name || '—'}</strong></span>
                      <span>•</span>
                      <span>{formatDateTime(review.created_at)}</span>
                      {review.quality_rating && (
                        <>
                          <span>•</span>
                          <span>Qualidade: {review.quality_rating}/5</span>
                        </>
                      )}
                      {review.price_rating && (
                        <>
                          <span>•</span>
                          <span>Preço: {review.price_rating}/5</span>
                        </>
                      )}
                      {review.time_rating && (
                        <>
                          <span>•</span>
                          <span>Tempo: {review.time_rating}/5</span>
                        </>
                      )}
                    </div>

                    {/* Hidden reason */}
                    {review.hidden_at && review.hidden_reason && (
                      <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-sm">
                        <span className="text-red-600 dark:text-red-400 font-medium">Motivo: </span>
                        <span className="text-red-700 dark:text-red-300">{review.hidden_reason}</span>
                        <span className="text-red-400 dark:text-red-500 text-xs ml-2">por {review.hidden_by}</span>
                      </div>
                    )}

                    {/* Admin response */}
                    {review.admin_response && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Resposta MECA: </span>
                        <span className="text-blue-700 dark:text-blue-300">{review.admin_response}</span>
                        <span className="text-blue-400 dark:text-blue-500 text-xs ml-2">
                          por {review.admin_response_by} em {review.admin_response_at ? formatDateTime(review.admin_response_at) : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!review.admin_response && (
                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setResponseText('')
                          setRespondDialogOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-colors"
                        title="Responder como MECA"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Responder
                      </button>
                    )}

                    {review.hidden_at ? (
                      <button
                        onClick={() => handleUnhide(review)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors"
                        title="Tornar visível novamente"
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors"
                        title="Ocultar avaliação"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Ocultar
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
      </div>

      {/* Hide Dialog */}
      {hideDialogOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ocultar avaliação</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Avaliação de <strong>{customerName(selectedReview)}</strong> ({selectedReview.rating} estrelas) para <strong>{selectedReview.workshop_name}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motivo *
            </label>
            <textarea
              value={hideReason}
              onChange={e => setHideReason(e.target.value)}
              placeholder="Explique o motivo para ocultar esta avaliação..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white text-sm resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setHideDialogOpen(false); setSelectedReview(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleHide}
                disabled={!hideReason.trim() || actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Ocultando...' : 'Ocultar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Respond Dialog */}
      {respondDialogOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Responder como MECA</h3>
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Stars count={selectedReview.rating} />
                <span className="font-medium text-gray-900 dark:text-white">{customerName(selectedReview)}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                {selectedReview.comment || 'Sem comentário'}
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resposta *
            </label>
            <textarea
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="Digite a resposta oficial da MECA..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white text-sm resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRespondDialogOpen(false); setSelectedReview(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRespond}
                disabled={!responseText.trim() || actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Enviando...' : 'Enviar resposta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
