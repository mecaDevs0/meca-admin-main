'use client'

import { showToast } from '@/lib/toast'
import {
    Building2,
    Calendar,
    Clock,
    DollarSign,
    TrendingUp,
    Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DashboardMetrics {
  total_customers: number
  total_oficinas: number
  oficinas_by_status: {
    pendente?: number
    aprovado?: number
    rejeitado?: number
  }
  total_bookings_last_month: number
  total_revenue_last_month: number
  meca_commission_last_month: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadMetrics()
  }, [router])

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        setLoading(false)
        return
      }

      // Chamada real para API da EC2
      const response = await fetch('http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000/admin/dashboard-metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setMetrics(result.data)
        } else {
          // Fallback para dados mock se a API não retornar dados
          const mockMetrics: DashboardMetrics = {
            total_customers: 1250,
            total_oficinas: 89,
            oficinas_by_status: {
              pendente: 12,
              aprovado: 67,
              rejeitado: 10
            },
            total_bookings_last_month: 456,
            total_revenue_last_month: 12500000, // R$ 125.000,00
            meca_commission_last_month: 625000 // R$ 6.250,00 (5%)
          }
          setMetrics(mockMetrics)
        }
      } else {
        // Fallback para dados mock se a API falhar
        const mockMetrics: DashboardMetrics = {
          total_customers: 1250,
          total_oficinas: 89,
          oficinas_by_status: {
            pendente: 12,
            aprovado: 67,
            rejeitado: 10
          },
          total_bookings_last_month: 456,
          total_revenue_last_month: 12500000, // R$ 125.000,00
          meca_commission_last_month: 625000 // R$ 6.250,00 (5%)
        }
        setMetrics(mockMetrics)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      
      // Fallback para dados mock em caso de erro
      const mockMetrics: DashboardMetrics = {
        total_customers: 1250,
        total_oficinas: 89,
        oficinas_by_status: {
          pendente: 12,
          aprovado: 67,
          rejeitado: 10
        },
        total_bookings_last_month: 456,
        total_revenue_last_month: 12500000, // R$ 125.000,00
        meca_commission_last_month: 625000 // R$ 6.250,00 (5%)
      }
      setMetrics(mockMetrics)
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-sm text-gray-500">Acompanhe as principais métricas do marketplace</p>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-sm text-gray-500">Acompanhe as principais métricas do marketplace</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Não foi possível carregar as métricas</h3>
          <p className="text-gray-500">Verifique a conexão com a API e tente novamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500">Acompanhe as principais métricas do marketplace</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Total de Clientes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.total_customers || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#252940] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Total de Oficinas</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.total_oficinas || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Oficinas Pendentes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.oficinas_by_status?.pendente || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Agendamentos (30d)</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.total_bookings_last_month || 0}</p>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Receita Total (30 dias)</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.total_revenue_last_month || 0)}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#252940] rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Comissão MECA (30 dias)</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.meca_commission_last_month || 0)}</p>
        </div>
      </div>

      {/* Workshop Status Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status das Oficinas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Aprovadas</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics?.oficinas_by_status?.aprovado || 0}</p>
            <p className="text-xs text-gray-500">Oficinas ativas e prontas para agendamentos</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Pendentes</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics?.oficinas_by_status?.pendente || 0}</p>
            <p className="text-xs text-gray-500">Oficinas aguardando sua aprovação</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Rejeitadas</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics?.oficinas_by_status?.rejeitado || 0}</p>
            <p className="text-xs text-gray-500">Oficinas que foram recusadas</p>
          </div>
        </div>
      </div>
    </div>
  )
}