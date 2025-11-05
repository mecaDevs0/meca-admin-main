'use client'

import ServiceCard from '@/components/services/ServiceCard'
import ServiceModal from '@/components/services/ServiceModal'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { AlertCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MasterService {
  id: string
  title: string
  description?: string
  category?: string
}

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<MasterService[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<MasterService | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', category: '' })

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadServices()
  }, [router])

  const loadServices = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        router.push('/login')
        return
      }
      apiClient.setToken(token)
      
      const { data, error } = await apiClient.getServices()
      
      if (error || !data) {
        showToast.error('Erro ao carregar serviços', error || 'Não foi possível carregar os dados')
        setServices([])
        setLoading(false)
        return
      }
      
      // A API retorna { success: true, services: [...] } ou { success: true, data: { services: [...] } }
      const servicesData = data.services || data.data?.services || (Array.isArray(data) ? data : data.data || [])
      
      // Mapear dados reais da API para o formato esperado
      const mappedServices = servicesData.map((service: any) => ({
        id: service.id,
        title: service.name || service.title || 'Sem nome',
        description: service.description || 'Descrição não disponível',
        category: service.category || 'Geral'
      }))
      
      setServices(mappedServices)
    } catch (error) {
      console.error('Erro na requisição:', error)
      showToast.error('Erro', 'Ocorreu um erro ao carregar os serviços')
      setServices([])
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingService) {
      await showToast.promise(
        apiClient.updateService(editingService.id, {
          name: formData.title,
          description: formData.description,
          category: formData.category
        }),
        {
          loading: 'Atualizando serviço...',
          success: 'Serviço atualizado com sucesso!',
          error: (err) => err || 'Erro ao atualizar serviço',
        }
      )
      loadServices()
      closeModal()
    } else {
      await showToast.promise(
        apiClient.createService({
          name: formData.title,
          description: formData.description,
          category: formData.category
        }),
        {
          loading: 'Criando serviço...',
          success: 'Serviço criado com sucesso!',
          error: (err) => err || 'Erro ao criar serviço',
        }
      )
      loadServices()
      closeModal()
    }
  }

  const handleDelete = async (id: string) => {
    // Criar modal de confirmação customizado com Sonner
    showToast.warning('Confirmar exclusão?', 'Esta ação não pode ser desfeita')
    
    // Por enquanto mantém o confirm nativo, mas pode ser substituído por um modal customizado
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    
    await showToast.promise(
      apiClient.deleteService(id),
      {
        loading: 'Excluindo serviço...',
        success: 'Serviço excluído com sucesso!',
        error: (err) => err || 'Erro ao excluir serviço',
      }
    )
    loadServices()
  }

  const openModal = (service?: MasterService) => {
    if (service) {
      setEditingService(service)
      setFormData({
        title: service.title,
        description: service.description || '',
        category: service.category || '',
      })
    } else {
      setEditingService(null)
      setFormData({ title: '', description: '', category: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
    setFormData({ title: '', description: '', category: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Serviços</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Catálogo de serviços base</p>
          </div>
        
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {services.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum serviço encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Crie seu primeiro serviço para começar.</p>
              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 mx-auto shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Criar Serviço
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={() => openModal(service)}
                  onDelete={() => handleDelete(service.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ServiceModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        onFormChange={setFormData}
        isEditing={!!editingService}
      />
      </div>
    </div>
  )
}

