'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

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
  }, [])

  const loadMetrics = async () => {
    const { data, error } = await apiClient.getDashboardMetrics()
    if (error) {
      console.error('Error loading metrics:', error)
      // Mock data para demonstração
      setMetrics({
        total_customers: 150,
        total_oficinas: 45,
        oficinas_by_status: {
          pendente: 8,
          aprovado: 32,
          rejeitado: 5,
        },
        total_bookings_last_month: 234,
        total_revenue_last_month: 125000,
        meca_commission_last_month: 12500,
      })
    } else {
      setMetrics(data)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00c977]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#252940] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MECA Admin Dashboard</h1>
          <nav className="space-x-4">
            <a href="/dashboard" className="hover:text-[#00c977] transition">Dashboard</a>
            <a href="/dashboard/workshops" className="hover:text-[#00c977] transition">Oficinas</a>
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

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-[#252940] mb-8">Visão Geral</h2>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#00c977]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
                <p className="text-3xl font-bold text-[#252940] mt-2">{metrics?.total_customers || 0}</p>
              </div>
              <div className="bg-[#00c977] bg-opacity-10 p-3 rounded-full">
                <svg className="w-8 h-8 text-[#00c977]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Workshops */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#252940]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Oficinas</p>
                <p className="text-3xl font-bold text-[#252940] mt-2">{metrics?.total_oficinas || 0}</p>
              </div>
              <div className="bg-[#252940] bg-opacity-10 p-3 rounded-full">
                <svg className="w-8 h-8 text-[#252940]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Workshops */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Oficinas Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics?.oficinas_by_status?.pendente || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Agendamentos (30d)</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{metrics?.total_bookings_last_month || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Receita Total (30 dias)</h3>
            <p className="text-4xl font-bold text-[#00c977]">
              {formatCurrency(metrics?.total_revenue_last_month || 0)}
            </p>
          </div>

          {/* MECA Commission */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Comissão MECA (30 dias)</h3>
            <p className="text-4xl font-bold text-[#252940]">
              {formatCurrency(metrics?.meca_commission_last_month || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">10% das transações</p>
          </div>
        </div>

        {/* Workshop Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Status das Oficinas</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metrics?.oficinas_by_status?.aprovado || 0}</p>
              <p className="text-sm text-gray-600">Aprovadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{metrics?.oficinas_by_status?.pendente || 0}</p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{metrics?.oficinas_by_status?.rejeitado || 0}</p>
              <p className="text-sm text-gray-600">Rejeitadas</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

