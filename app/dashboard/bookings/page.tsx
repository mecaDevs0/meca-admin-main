'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Booking {
  id: string
  customer_id: string
  oficina_id: string
  vehicle_id: string
  product_id: string
  appointment_date: string
  status: string
  customer_notes?: string
  first_name?: string
  last_name?: string
  customer_phone?: string
  customer_email?: string
  plate?: string
  brand?: string
  model?: string
  year?: string
  service_name?: string
  service_description?: string
  oficina_name?: string
  oficina_email?: string
  oficina_phone?: string
  created_at: string
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadBookings()
  }, [filter, router])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://18.222.129.59:9000'
      const token = localStorage.getItem('meca_admin_token')
      
      const url = filter === 'all' 
        ? `${API_URL}/admin/bookings`
        : `${API_URL}/admin/bookings?status=${filter}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (response.ok && result.success && result.data) {
        setBookings(result.data)
      } else {
        console.error('Erro ao carregar agendamentos:', result)
        setBookings([])
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      setBookings([])
    }
    
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      case 'confirmed':
      case 'confirmado':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      case 'in_progress':
      case 'em_andamento':
      case 'em andamento':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
      case 'completed':
      case 'finalizado':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case 'pending':
      case 'pendente':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
      case 'confirmado':
        return <CheckCircle className="w-4 h-4" />
      case 'completed':
      case 'finalizado':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
      case 'cancelado':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatStatus = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'pendente': 'Pendente',
      'confirmed': 'Confirmado',
      'confirmado': 'Confirmado',
      'in_progress': 'Em Andamento',
      'em_andamento': 'Em Andamento',
      'em andamento': 'Em Andamento',
      'completed': 'Finalizado',
      'finalizado': 'Finalizado',
      'cancelled': 'Cancelado',
      'cancelado': 'Cancelado'
    }
    return statusMap[normalizedStatus] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Agendamentos</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie todos os agendamentos da plataforma</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendentes' },
            { value: 'confirmed', label: 'Confirmados' },
            { value: 'in_progress', label: 'Em Andamento' },
            { value: 'completed', label: 'Finalizados' },
            { value: 'cancelled', label: 'Cancelados' }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === filterOption.value
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Não há agendamentos com o filtro selecionado no momento.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl p-6 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Informações principais */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="text-xs font-medium">{formatStatus(booking.status)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {booking.service_name || 'Serviço não informado'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{booking.service_description || ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Cliente */}
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.first_name && booking.last_name
                            ? `${booking.first_name} ${booking.last_name}`
                            : 'Não informado'}
                        </p>
                        {booking.customer_email && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{booking.customer_email}</p>
                        )}
                        {booking.customer_phone && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{booking.customer_phone}</p>
                        )}
                      </div>

                      {/* Veículo */}
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Veículo</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.plate
                            ? `${booking.brand || ''} ${booking.model || ''} ${booking.year || ''} - ${booking.plate}`
                            : 'Não informado'}
                        </p>
                      </div>

                      {/* Oficina */}
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Oficina</p>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.oficina_name || 'Não informado'}</p>
                        {booking.oficina_email && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{booking.oficina_email}</p>
                        )}
                        {booking.oficina_phone && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{booking.oficina_phone}</p>
                        )}
                      </div>

                      {/* Data */}
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Data e Hora</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.appointment_date)}</p>
                      </div>
                    </div>

                    {booking.customer_notes && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Observações do Cliente</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{booking.customer_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>
    </div>
  )
}


