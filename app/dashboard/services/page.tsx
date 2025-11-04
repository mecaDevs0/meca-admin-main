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
      const response = await fetch('/api/admin/master-services')
      const result = await response.json()
      
      if (response.ok && result.services) {
        // Mapear dados reais da API para o formato esperado
        const mappedServices = result.services.map((service: any) => ({
          id: service.id,
          title: service.name || service.title,
          description: service.description || 'Descrição não disponível',
          category: service.category || 'Geral'
        }))
        setServices(mappedServices)
      } else {
        console.error('Erro ao carregar serviços:', result)
        setServices([])
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500">Catálogo de serviços base</p>
        </div>
        
        <button
          onClick={() => openModal()}
          className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
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
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço encontrado</h3>
              <p className="text-gray-500 mb-4">Crie seu primeiro serviço para começar.</p>
              <button
                onClick={() => openModal()}
                className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
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
  )
}}
}}
}
}
}
}
}
}

