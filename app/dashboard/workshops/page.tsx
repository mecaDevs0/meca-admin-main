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
  const [filter, setFilter] = useState<string>('pendente')
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadWorkshops()
  }, [filter, router])

  const loadWorkshops = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/workshops?status=${filter}`)
      const result = await response.json()
      
      if (response.ok && result.oficinas) {
        // Mapear dados reais da API para o formato esperado
        const mappedWorkshops = result.oficinas.map((workshop: any) => ({
          id: workshop.id,
          name: workshop.name,
          cnpj: workshop.cnpj,
          email: workshop.email,
          phone: workshop.phone || 'Não informado',
          address: workshop.address ? 
            `${workshop.address.logradouro || ''}, ${workshop.address.cidade || ''}, ${workshop.address.estado || ''}`.trim() :
            'Endereço não informado',
          status: workshop.status,
          created_at: workshop.created_at
        }))
        setWorkshops(mappedWorkshops)
      } else {
        console.error('Erro ao carregar oficinas:', result)
        setWorkshops([])
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      setWorkshops([])
    }
    
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const loadingToast = showToast.loading('Aprovando oficina...')
    
    try {
      const { data, error } = await apiClient.approveWorkshop(id)
      
      // Remover toast de loading
      showToast.dismiss(loadingToast)
      
      if (!error && data) {
        showToast.success('Oficina aprovada!', `Oficina foi aprovada com sucesso`)
        
        // Aguardar um pouco e recarregar a lista para garantir que o backend processou
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
      
      // Remover toast de loading
      showToast.dismiss(loadingToast)
      
      if (!error && data) {
        showToast.success('Oficina rejeitada', 'A oficina foi rejeitada e notificada')
        setSelectedWorkshop(null)
        setRejectReason('')
        
        // Aguardar um pouco e recarregar a lista
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Oficinas</h1>
            <p className="text-sm text-gray-500">Gerencie o cadastro e aprovação de oficinas</p>
          </div>
        </div>
      </div>

      <FilterButtons activeFilter={filter} onFilterChange={setFilter} />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma oficina encontrada</h3>
              <p className="text-gray-500">Não há oficinas com o status selecionado no momento.</p>
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
  )
}