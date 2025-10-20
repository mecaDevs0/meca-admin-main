'use client'

import { FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ReportsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500">Acompanhe métricas e performance da plataforma</p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatório de Vendas</h3>
          <p className="text-sm text-gray-600 mb-4">Análise de receita e transações</p>
          <button className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatório de Oficinas</h3>
          <p className="text-sm text-gray-600 mb-4">Performance e aprovações de oficinas</p>
          <button className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatório de Usuários</h3>
          <p className="text-sm text-gray-600 mb-4">Crescimento e atividade de usuários</p>
          <button className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatório de Serviços</h3>
          <p className="text-sm text-gray-600 mb-4">Serviços mais solicitados</p>
          <button className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatório Financeiro</h3>
          <p className="text-sm text-gray-600 mb-4">Comissões e pagamentos</p>
          <button className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatório de Satisfação</h3>
          <p className="text-sm text-gray-600 mb-4">Avaliações e feedback</p>
          <button className="bg-[#00c977] hover:bg-[#00b369] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Recentes</h2>
        
        <div className="text-center py-8">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório gerado</h3>
          <p className="text-gray-500">Os relatórios gerados aparecerão aqui.</p>
        </div>
      </div>
    </div>
  )
}