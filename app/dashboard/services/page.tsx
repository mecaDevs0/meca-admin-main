'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

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
  }, [])

  const loadServices = async () => {
    setLoading(true)
    const { data, error } = await apiClient.getMasterServices()
    
    if (error) {
      // Mock data
      setServices([
        { id: '1', title: 'Troca de Óleo', description: 'Troca de óleo e filtros', category: 'Manutenção' },
        { id: '2', title: 'Alinhamento e Balanceamento', description: 'Alinhamento e balanceamento de rodas', category: 'Manutenção' },
        { id: '3', title: 'Revisão Geral', description: 'Revisão completa do veículo', category: 'Manutenção' },
      ])
    } else {
      setServices(data.master_services || [])
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingService) {
      const { error } = await apiClient.updateMasterService(editingService.id, formData)
      if (!error) {
        alert('Serviço atualizado com sucesso!')
        loadServices()
        closeModal()
      }
    } else {
      const { error } = await apiClient.createMasterService(formData)
      if (!error) {
        alert('Serviço criado com sucesso!')
        loadServices()
        closeModal()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    
    const { error } = await apiClient.deleteMasterService(id)
    if (!error) {
      alert('Serviço excluído com sucesso!')
      loadServices()
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#252940] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Serviços</h1>
          <nav className="space-x-4">
            <a href="/dashboard" className="hover:text-[#00c977] transition">Dashboard</a>
            <a href="/dashboard/workshops" className="hover:text-[#00c977] transition">Oficinas</a>
            <a href="/dashboard/services" className="text-[#00c977]">Serviços</a>
            <button
              onClick={() => {
                localStorage.removeItem('meca_admin_token')
                router.push('/login')
              }}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#252940]">Serviços Base do Sistema</h2>
          <button
            onClick={() => openModal()}
            className="bg-[#00c977] hover:bg-[#00b369] text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Serviço
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00c977]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#252940]">{service.title}</h3>
                    {service.category && (
                      <span className="inline-block mt-2 px-3 py-1 bg-[#00c977] bg-opacity-10 text-[#00c977] rounded-full text-xs font-medium">
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {service.description && (
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(service)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[#252940] mb-6">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Serviço *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#00c977] focus:border-transparent outline-none"
                  placeholder="Ex: Troca de Óleo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#00c977] focus:border-transparent outline-none"
                  placeholder="Ex: Manutenção, Elétrica, Funilaria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-[#00c977] focus:border-transparent outline-none"
                  placeholder="Descrição do serviço..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#00c977] hover:bg-[#00b369] text-white py-3 rounded-lg font-medium transition"
                >
                  {editingService ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

