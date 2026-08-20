'use client'

import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Pagination from '@/components/ui/Pagination'
import FilterButtons from '@/components/workshops/FilterButtons'
import RejectModal from '@/components/workshops/RejectModal'
import WorkshopCard from '@/components/workshops/WorkshopCard'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { exportCsv, csvFilename } from '@/lib/csv'
import { formatPhone, formatCnpj } from '@/lib/utils'
import { AlertCircle, Building2, Clock, Download, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Workshop {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
  owner_name?: string
  logo_url?: string
  completed_services_count?: number
  acquisition_source?: string | null
}

export default function WorkshopsPage() {
  return (
    <ErrorBoundary label="Oficinas">
      <Suspense>
        <WorkshopsPageInner />
      </Suspense>
    </ErrorBoundary>
  )
}

function WorkshopsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const PAGE_SIZE = 20
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page')
    return p ? Math.max(1, parseInt(p, 10) || 1) : 1
  })
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    
    const statusParam = searchParams.get('status')
    if (statusParam && (statusParam === 'pending' || statusParam === 'pendente')) {
      setFilter('pendente')
    }
  }, [router])

  const handlePageChange = (p: number) => {
    setPage(p)
    const params = new URLSearchParams(window.location.search)
    if (p > 1) params.set('page', String(p)); else params.delete('page')
    router.replace(`?${params}`, { scroll: false })
  }

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (token) {
      apiClient.setToken(token)
      loadWorkshops()
    }
  }, [filter])

  const loadWorkshops = async () => {
    setLoading(true)
    try {
      // Normalizar status para a API: 'pendente' -> 'pending'
      let statusParam = filter === 'all' ? undefined : filter
      if (statusParam === 'pendente') statusParam = 'pending'
      if (statusParam === 'aprovado') statusParam = 'approved'
      if (statusParam === 'rejeitado') statusParam = 'rejected'
      
      const { data, error } = await apiClient.getWorkshops(statusParam)

      if (error || !data) {
        showToast.error('Erro ao carregar oficinas', error || 'Não foi possível carregar os dados')
        setWorkshops([])
        return
      }

      // A API retorna { success: true, oficinas: [...] } ou { success: true, data: { oficinas: [...] } }
      const d = (data ?? {}) as {
        oficinas?: unknown
        data?: unknown
      }
      const rawList: unknown =
        (Array.isArray(d.oficinas) ? d.oficinas : undefined) ??
        (Array.isArray(d.data) ? d.data : undefined) ??
        (d.data && typeof d.data === 'object' && Array.isArray((d.data as any).oficinas)
          ? (d.data as any).oficinas
          : undefined) ??
        []
      const workshopsData: any[] = Array.isArray(rawList) ? rawList : []

      // Mapear dados da API para o formato esperado — cada item isolado em try/catch
      // para que UMA oficina malformada não derrube a lista inteira
      const mappedWorkshops: Workshop[] = []
      for (const raw of workshopsData) {
        try {
          const w = (raw && typeof raw === 'object') ? raw as any : {}
          // Normalizar status: aceita pending/approved/rejected + pendente/aprovado/rejeitado + null
          let normalizedStatus = String(w.status ?? 'pendente').toLowerCase().trim()
          if (normalizedStatus === 'pending' || normalizedStatus === '' || normalizedStatus === 'null') normalizedStatus = 'pendente'
          if (normalizedStatus === 'approved') normalizedStatus = 'aprovado'
          if (normalizedStatus === 'rejected') normalizedStatus = 'rejeitado'
          if (!['pendente', 'aprovado', 'rejeitado'].includes(normalizedStatus)) normalizedStatus = 'pendente'

          const addressParts = [w.address, w.city, w.state].filter((p) => p && String(p).trim().length > 0)
          const addressStr = addressParts.length > 0 ? addressParts.join(', ') : 'Endereço não informado'

          mappedWorkshops.push({
            id: String(w.id ?? ''),
            name: w.name ? String(w.name) : 'Sem nome',
            cnpj: w.cnpj ? String(w.cnpj) : 'Não informado',
            email: w.email ? String(w.email) : 'Não informado',
            phone: w.phone ? String(w.phone) : 'Não informado',
            address: addressStr,
            status: normalizedStatus as 'pendente' | 'aprovado' | 'rejeitado',
            created_at: w.created_at ? String(w.created_at) : new Date().toISOString(),
            owner_name: w.owner_name ? String(w.owner_name) : undefined,
            logo_url: w.logo_url ? String(w.logo_url) : undefined,
            completed_services_count: parseInt(w.completed_services_count ?? '0', 10),
          })
        } catch (mapErr) {
          void mapErr
        }
      }

      setWorkshops(mappedWorkshops)
    } catch {
      showToast.error('Erro', 'Ocorreu um erro ao carregar as oficinas')
      setWorkshops([])
    }
    
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const loadingToast = showToast.loading('Aprovando oficina...')
    
    try {
      const { data, error } = await apiClient.approveWorkshop(id)
      
      showToast.dismiss(loadingToast)
      
      if (!error && data) {
        showToast.success('Oficina aprovada!', 'A oficina foi aprovada com sucesso')
        
        setTimeout(() => {
          loadWorkshops()
        }, 500)
      } else {
        showToast.error('Erro ao aprovar', error || 'Não foi possível aprovar a oficina')
      }
    } catch (err) {
      showToast.dismiss(loadingToast)
      showToast.error('Erro ao aprovar', 'Ocorreu um erro inesperado')
    }
  }

  const handleReject = async () => {
    if (!selectedWorkshop || !rejectReason) {
      showToast.warning('Atenção', 'Informe o motivo da rejeição')
      return
    }
    
    const loadingToast = showToast.loading('Rejeitando oficina...')
    
    try {
      const { data, error } = await apiClient.rejectWorkshop(selectedWorkshop, rejectReason)
      
      showToast.dismiss(loadingToast)
      
      if (!error && data) {
        showToast.success('Oficina rejeitada', 'A oficina foi rejeitada e notificada')
        setSelectedWorkshop(null)
        setRejectReason('')
        
        setTimeout(() => {
          loadWorkshops()
        }, 500)
      } else {
        showToast.error('Erro ao rejeitar', error || 'Não foi possível rejeitar a oficina')
      }
    } catch (err) {
      showToast.dismiss(loadingToast)
      showToast.error('Erro ao rejeitar', 'Ocorreu um erro inesperado')
    }
  }

  const handleDeleteClick = (id: string) => {
    const ws = workshops.find(w => w.id === id)
    if (ws) setDeleteTarget({ id, name: ws.name })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const loadingToast = showToast.loading('Excluindo oficina...')

    try {
      const { data, error } = await apiClient.deleteWorkshop(deleteTarget.id)
      showToast.dismiss(loadingToast)

      if (!error && data) {
        showToast.success('Oficina excluída com sucesso', `"${deleteTarget.name}" foi removida`)
        setDeleteTarget(null)
        setTimeout(() => loadWorkshops(), 500)
      } else {
        showToast.error('Erro ao excluir', error || 'Não foi possível excluir a oficina')
      }
    } catch (err) {
      showToast.dismiss(loadingToast)
      showToast.error('Erro ao excluir', 'Ocorreu um erro inesperado')
    } finally {
      setIsDeleting(false)
    }
  }

  const q = search.toLowerCase().trim()
  const filtered = q
    ? workshops.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.cnpj.toLowerCase().includes(q) ||
        w.email.toLowerCase().includes(q) ||
        w.phone.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        (w.owner_name ?? '').toLowerCase().includes(q)
      )
    : workshops
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Oficinas</h1>
              <p className="text-gray-600 dark:text-gray-400">Gerencie o cadastro e aprovação de oficinas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                aria-label="Buscar oficinas"
                placeholder="Buscar por nome, CNPJ, email ou cidade..."
                value={search}
                onChange={e => { setSearch(e.target.value); handlePageChange(1) }}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00c977]/40 focus:border-[#00c977] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => exportCsv(csvFilename('oficinas'), [
                { header: 'Nome', accessor: (w: Workshop) => w.name },
                { header: 'CNPJ', accessor: (w: Workshop) => formatCnpj(w.cnpj) },
                { header: 'Email', accessor: (w: Workshop) => w.email },
                { header: 'Telefone', accessor: (w: Workshop) => formatPhone(w.phone) },
                { header: 'Endereço', accessor: (w: Workshop) => w.address },
                { header: 'Status', accessor: (w: Workshop) => w.status },
                { header: 'Proprietário', accessor: (w: Workshop) => w.owner_name },
                { header: 'Cadastro', accessor: (w: Workshop) => new Date(w.created_at).toLocaleDateString('pt-BR') },
              ], filtered)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        <FilterButtons activeFilter={filter} onFilterChange={setFilter} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-12 text-center"
              >
                <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhuma oficina encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {q ? 'Nenhuma oficina corresponde à busca.' : 'Não há oficinas com o status selecionado no momento.'}
                </p>
              </motion.div>
            ) : (
              <>
                {filter === 'pendente' || filter === 'all' ? (
                  <div
                    className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-700/50 rounded-2xl p-4 mb-6 cursor-pointer hover:border-yellow-400 transition-colors"
                    onClick={() => setFilter('pendente')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFilter('pendente');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Filtrar oficinas pendentes de aprovação"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                          {workshops.filter(w => w.status === 'pendente').length} oficina{workshops.filter(w => w.status === 'pendente').length !== 1 ? 's' : ''} pendente{workshops.filter(w => w.status === 'pendente').length !== 1 ? 's' : ''} de aprovação
                        </h3>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">Clique para filtrar oficinas pendentes</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <div className="grid gap-4">
                  {paginated.map((workshop, index) => (
                    <motion.div
                      key={workshop.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <WorkshopCard
                        workshop={workshop}
                        onApprove={handleApprove}
                        onReject={() => setSelectedWorkshop(workshop.id)}
                        onDelete={handleDeleteClick}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={handlePageChange} />

        <RejectModal
          isOpen={!!selectedWorkshop}
          onClose={() => {
            setSelectedWorkshop(null)
            setRejectReason('')
          }}
          onConfirm={handleReject}
          reason={rejectReason}
          onReasonChange={setRejectReason}
        />

        {/* Modal de confirmação de exclusão */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir oficina</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja excluir a oficina <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
