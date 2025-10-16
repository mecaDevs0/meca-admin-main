'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

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
  }, [filter])

  const loadWorkshops = async () => {
    setLoading(true)
    const { data, error } = await apiClient.getWorkshops(filter)
    
    if (error) {
      // Mock data para demonstração
      setWorkshops([
        {
          id: '1',
          name: 'Oficina do João',
          cnpj: '12.345.678/0001-90',
          email: 'joao@oficina.com',
          phone: '(11) 98765-4321',
          address: 'Rua das Oficinas, 123 - São Paulo, SP',
          status: 'pendente',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Auto Center Maria',
          cnpj: '98.765.432/0001-10',
          email: 'maria@autocenter.com',
          phone: '(11) 91234-5678',
          address: 'Av. Principal, 456 - São Paulo, SP',
          status: 'pendente',
          created_at: new Date().toISOString(),
        },
      ])
    } else {
      setWorkshops(data.workshops || [])
    }
    
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const { error } = await apiClient.approveWorkshop(id)
    if (!error) {
      alert('Oficina aprovada com sucesso!')
      loadWorkshops()
    } else {
      alert('Erro ao aprovar oficina')
    }
  }

  const handleReject = async () => {
    if (!selectedWorkshop || !rejectReason) return
    
    const { error } = await apiClient.rejectWorkshop(selectedWorkshop, rejectReason)
    if (!error) {
      alert('Oficina rejeitada com sucesso!')
      setSelectedWorkshop(null)
      setRejectReason('')
      loadWorkshops()
    } else {
      alert('Erro ao rejeitar oficina')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      rejeitado: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#252940] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Oficinas</h1>
          <nav className="space-x-4">
            <a href="/dashboard" className="hover:text-[#00c977] transition">Dashboard</a>
            <a href="/dashboard/workshops" className="text-[#00c977]">Oficinas</a>
            <a href="/dashboard/services" className="hover:text-[#00c977] transition">Serviços</a>
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
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('pendente')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'pendente'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('aprovado')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'aprovado'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aprovadas
            </button>
            <button
              onClick={() => setFilter('rejeitado')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'rejeitado'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejeitadas
            </button>
          </div>
        </div>

        {/* Workshops List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00c977]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {workshops.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500">Nenhuma oficina encontrada</p>
              </div>
            ) : (
              workshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-[#252940]">{workshop.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(workshop.status)}`}>
                          {workshop.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-700">CNPJ</p>
                          <p>{workshop.cnpj}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Email</p>
                          <p>{workshop.email}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Telefone</p>
                          <p>{workshop.phone}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Endereço</p>
                          <p>{workshop.address}</p>
                        </div>
                      </div>
                    </div>

                    {workshop.status === 'pendente' && (
                      <div className="flex gap-2 ml-6">
                        <button
                          onClick={() => handleApprove(workshop.id)}
                          className="bg-[#00c977] hover:bg-[#00b369] text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => setSelectedWorkshop(workshop.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-[#252940] mb-4">Rejeitar Oficina</h3>
            <p className="text-gray-600 mb-4">Por favor, informe o motivo da rejeição:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Ex: Documentação incompleta, dados incorretos, etc."
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectReason}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
              >
                Confirmar Rejeição
              </button>
              <button
                onClick={() => {
                  setSelectedWorkshop(null)
                  setRejectReason('')
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

