'use client'

import FilterButtons from '@/components/workshops/FilterButtons'
import RejectModal from '@/components/workshops/RejectModal'
import WorkshopCard from '@/components/workshops/WorkshopCard'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { AlertCircle, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Workshop {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
}

export default function WorkshopsPage() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshops()
  }, [filter, router])

  const loadWorkshops = async () => {
    setLoading(true)
    try {
      const status = filter === 'all' ? undefined : filter
      const { data, error } = await apiClient.getWorkshops(status)

      if (error || !data) {
        showToast.error('Erro ao carregar oficinas', error || 'Não foi possível carregar os dados')
        setWorkshops([])
        return
      }

      // A API retorna { success: true, oficinas: [...] } ou { success: true, data: { oficinas: [...] } }
      const workshopsData = data.oficinas || data.data?.oficinas || (Array.isArray(data) ? data : data.data || [])
      
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
        status: workshop.status || 'pendente',
        created_at: workshop.created_at || new Date().toISOString()
      }))
      
      setWorkshops(mappedWorkshops)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao carregar as oficinas')
      console.error('Erro na requisição:', error)
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
        </div>

        <FilterButtons activeFilter={filter} onFilterChange={setFilter} />

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {workshops.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma oficina encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400">Não há oficinas com o status selecionado no momento.</p>
              </div>
            ) : (
              workshops.map((workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  onApprove={handleApprove}
                  onReject={() => setSelectedWorkshop(workshop.id)}
                />
              ))
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
      </div>
    </div>
  )
}
