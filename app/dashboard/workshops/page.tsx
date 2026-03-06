'use client'

import FilterButtons from '@/components/workshops/FilterButtons'
import RejectModal from '@/components/workshops/RejectModal'
import DisableWorkshopModal from '@/components/workshops/DisableWorkshopModal'
import WorkshopCard from '@/components/workshops/WorkshopCard'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'
import { AlertCircle, Building2, Clock, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Workshop {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
  meca_fee_percentage?: number | null
  logo_url?: string | null
  pagbank_account_status?: string | null
  pagbank_verified?: boolean
  pagbank_account_id?: string | null
}

export default function WorkshopsPage() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('') // valor do input (atualizado a cada tecla)
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null)
  const [disableWorkshopId, setDisableWorkshopId] = useState<string | null>(null)

  // Debounce da pesquisa: só envia "searchTerm" para a API após 400ms sem digitar
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadWorkshops = useCallback(async () => {
    setLoading(true)
    try {
      const status = filter === 'all' ? undefined : filter
      const { data: response, error } = await apiClient.getWorkshops(status, searchTerm || undefined)

      if (error) {
        showToast.error('Erro ao carregar oficinas', error || 'Não foi possível carregar os dados')
        setWorkshops([])
        return
      }

      // A API retorna { success: true, oficinas: [...] } ou { success: true, data: { oficinas: [...] } }
      // Primeiro tentar extrair de response.data, depois de response diretamente
      let rawWorkshops: any[] = []
      
      if (response && typeof response === 'object') {
        // Tentar response.data.oficinas primeiro
        if ('data' in response && response.data && typeof response.data === 'object' && 'oficinas' in response.data) {
          rawWorkshops = Array.isArray((response.data as { oficinas: unknown }).oficinas) 
            ? (response.data as { oficinas: unknown[] }).oficinas 
            : []
        }
        // Tentar response.oficinas
        else if ('oficinas' in response && Array.isArray(response.oficinas)) {
          rawWorkshops = response.oficinas
        }
        // Tentar response.data como array
        else if ('data' in response && Array.isArray(response.data)) {
          rawWorkshops = response.data
        }
        // Tentar response como array
        else if (Array.isArray(response)) {
          rawWorkshops = response
        }
      }

      const workshopsData = Array.isArray(rawWorkshops) ? rawWorkshops : []
      
      // Função para normalizar status da API (inglês) para o formato do frontend (português)
      const normalizeStatus = (status: string | null | undefined): 'pendente' | 'aprovado' | 'rejeitado' => {
        if (!status) return 'pendente'
        
        const normalized = status.toLowerCase().trim()
        
        // Mapear status em inglês para português
        if (normalized === 'approved' || normalized === 'aprovado') {
          return 'aprovado'
        }
        if (normalized === 'rejected' || normalized === 'rejeitado') {
          return 'rejeitado'
        }
        // pending, pendente, null, vazio, etc. = pendente
        return 'pendente'
      }

      // Mapear dados da API para o formato esperado
      const mappedWorkshops = workshopsData.map((workshop: any) => ({
        id: workshop.id,
        name: workshop.name || 'Sem nome',
        cnpj: workshop.cnpj || 'Não informado',
        email: workshop.email || 'Não informado',
        phone: workshop.phone || 'Não informado',
        address: workshop.address 
          ? `${workshop.address}, ${workshop.city || ''}, ${workshop.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
          : 'Endereço não informado',
        status: normalizeStatus(workshop.status),
        created_at: workshop.created_at || new Date().toISOString(),
        logo_url: workshop.logo_url || null,
        meca_fee_percentage:
          typeof workshop.meca_fee_percentage === 'number'
            ? workshop.meca_fee_percentage
            : workshop.meca_fee_percentage !== null && workshop.meca_fee_percentage !== undefined
              ? Number(workshop.meca_fee_percentage)
              : null,
        pagbank_account_status: workshop.pagbank_account_status || null,
        pagbank_verified: workshop.pagbank_verified === true,
        pagbank_account_id: workshop.pagbank_account_id || null,
      }))

      // Filtro no cliente também: garante que a lista filtra ao digitar (nome, email, CNPJ, telefone, endereço)
      const term = (searchTerm || '').trim().toLowerCase()
      const toShow = term
        ? mappedWorkshops.filter(
            (w) =>
              (w.name || '').toLowerCase().includes(term) ||
              (w.email || '').toLowerCase().includes(term) ||
              (w.cnpj || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
              (w.phone || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
              (w.address || '').toLowerCase().includes(term)
          )
        : mappedWorkshops

      setWorkshops(toShow)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao carregar as oficinas')
      console.error('Erro na requisição:', error)
      setWorkshops([])
    }
    
    setLoading(false)
  }, [filter, searchTerm])

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshops()
  }, [loadWorkshops, router, searchTerm])

  const handleApprove = async (id: string) => {
    const loadingToast = showToast.loading('Aprovando oficina...')
    
    try {
      const result = await apiClient.approveWorkshop(id)
      
      showToast.dismiss(loadingToast)
      
      // Verificar se a resposta indica sucesso (tanto no campo success quanto na ausência de error)
      const isSuccess = (result.success !== false) && !result.error && result.data
      
      if (isSuccess) {
        showToast.success('Oficina aprovada!', (result.data as any)?.message || 'A oficina foi aprovada com sucesso')
        
        setTimeout(() => {
          loadWorkshops()
        }, 500)
      } else {
        // Só mostrar erro se realmente houver erro
        const errorMessage = (result as any).error || (result.data as any)?.error || 'Não foi possível aprovar a oficina'
        showToast.error('Erro ao aprovar', errorMessage)
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

  const handleDisable = async (reason: string, details: string) => {
    if (!disableWorkshopId) return
    
    const loadingToast = showToast.loading('Desabilitando oficina...')
    
    try {
      const { data, error } = await apiClient.disableWorkshop(disableWorkshopId, reason, details)
      
      showToast.dismiss(loadingToast)
      
      if (!error && data) {
        showToast.success('Oficina desabilitada', 'A oficina foi desabilitada e um email foi enviado')
        setDisableWorkshopId(null)
        
        setTimeout(() => {
          loadWorkshops()
        }, 500)
      } else {
        throw new Error(error || 'Não foi possível desabilitar a oficina')
      }
    } catch (err: any) {
      showToast.dismiss(loadingToast)
      showToast.error('Erro ao desabilitar', err.message || 'Ocorreu um erro inesperado')
      throw err
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Oficinas</h1>
                <p className="text-gray-600 dark:text-gray-400">Gerencie o cadastro e aprovação de oficinas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, telefone, CNPJ, cidade ou estado..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#00c977] focus:ring-2 focus:ring-[#00c977]/20 focus:outline-none transition-all shadow-sm"
            />
            {(searchInput || searchTerm) && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearchTerm('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-medium"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <FilterButtons activeFilter={filter} onFilterChange={setFilter} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {workshops.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-12 text-center"
              >
                <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhuma oficina encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? `Nenhuma oficina corresponde à busca "${searchTerm}". Tente outro termo ou limpe o filtro.`
                    : 'Não há oficinas com o status selecionado no momento.'}
                </p>
              </motion.div>
            ) : (
              <>
                {filter === 'pendente' || filter === 'all' ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-700/50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                          {workshops.filter(w => w.status === 'pendente').length} oficina{workshops.filter(w => w.status === 'pendente').length !== 1 ? 's' : ''} pendente{workshops.filter(w => w.status === 'pendente').length !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">Aprove ou rejeite as oficinas pendentes</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <div className="grid gap-4">
                  {workshops.map((workshop, index) => (
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
                        onDisable={() => setDisableWorkshopId(workshop.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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

        <DisableWorkshopModal
          isOpen={!!disableWorkshopId}
          workshopName={workshops.find(w => w.id === disableWorkshopId)?.name || 'Oficina'}
          onClose={() => setDisableWorkshopId(null)}
          onConfirm={handleDisable}
        />
      </div>
    </div>
  )
}
