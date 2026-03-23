'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard, DollarSign, Wallet, XCircle } from 'lucide-react'
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
  payment_status?: string
  quote_total?: number
  quote_final?: number
  quote_labor_cost?: number
  payment_provider?: string
  payment_method?: string
}

interface Payment {
  id: string
  booking_id?: string
  amount: number
  status: string
  payment_method?: string
  payment_provider?: string
  split_amount?: number
  fee_amount?: number
  created_at: string
  appointment_date?: string
  first_name?: string
  last_name?: string
  plate?: string
  oficina_name?: string
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments'>('bookings')
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [loadingPayments, setLoadingPayments] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadBookings()
  }, [filter, router])

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments()
    }
  }, [paymentFilter, activeTab])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      const { data, error } = await apiClient.getBookings(filter !== 'all' ? filter : undefined)
      if (data && !error) {
        const raw = (data as any).data ?? data
        setBookings(Array.isArray(raw) ? raw : [])
      } else {
        console.error('Erro ao carregar agendamentos:', error)
        setBookings([])
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      setBookings([])
    }
    setLoading(false)
  }

  const loadPayments = async () => {
    setLoadingPayments(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      const { data, error } = await apiClient.getPayments(
        paymentFilter !== 'all' ? { status: paymentFilter } : undefined
      )
      if (data && !error) {
        const raw = (data as any).data ?? data
        setPayments(Array.isArray(raw) ? raw : [])
      }
    } catch (e) {
      console.error('Erro:', e)
    }
    setLoadingPayments(false)
  }

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
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

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'pago':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Agendamentos & Pagamentos</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie agendamentos e o histórico financeiro da plataforma</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agendamentos
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Pagamentos
          </button>
        </div>

        {/* --- BOOKINGS TAB --- */}
        {activeTab === 'bookings' && (
          <>
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

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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

                            {/* Data e Hora */}
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-1">Data e Hora</p>
                              <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.appointment_date)}</p>
                            </div>

                            {/* Financeiro */}
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-1">Pagamento</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(booking.quote_final || booking.quote_total)}
                                </p>
                                {booking.payment_status && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                                    {booking.payment_status === 'pago' ? 'Pago' : booking.payment_status === 'pendente' ? 'Pendente' : booking.payment_status}
                                  </span>
                                )}
                                {booking.payment_provider && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    booking.payment_provider === 'asaas'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                  }`}>
                                    {booking.payment_provider === 'asaas' ? 'Asaas' : 'PagBank'}
                                  </span>
                                )}
                              </div>
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
          </>
        )}

        {/* --- PAYMENTS TAB --- */}
        {activeTab === 'payments' && (
          <>
            {/* Payment Filters */}
            <div className="mb-6 flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'approved', label: 'Aprovados' },
                { value: 'pending', label: 'Pendentes' },
                { value: 'cancelled', label: 'Cancelados' }
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setPaymentFilter(filterOption.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    paymentFilter === filterOption.value
                      ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            {loadingPayments ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
                <Wallet className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum pagamento encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400">Não há pagamentos com o filtro selecionado no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl p-6 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: oficina + cliente + placa */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Oficina</p>
                          <p className="font-medium text-gray-900 dark:text-white">{payment.oficina_name || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {payment.first_name && payment.last_name
                              ? `${payment.first_name} ${payment.last_name}`
                              : 'Não informado'}
                          </p>
                          {payment.plate && (
                            <p className="text-gray-600 dark:text-gray-400 text-xs">{payment.plate}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Data</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(payment.created_at)}</p>
                        </div>
                      </div>

                      {/* Right: value + badges */}
                      <div className="flex items-center gap-3 flex-wrap md:flex-nowrap md:justify-end">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                          {(payment.split_amount != null || payment.fee_amount != null) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Oficina: {formatCurrency(payment.split_amount)} · Taxa: {formatCurrency(payment.fee_amount)}
                            </p>
                          )}
                        </div>

                        {/* Method badge */}
                        {payment.payment_method && (
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.payment_method?.toLowerCase().includes('pix')
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          }`}>
                            <CreditCard className="w-3 h-3" />
                            {payment.payment_method?.toLowerCase().includes('pix') ? 'PIX' : 'Cartão'}
                          </span>
                        )}

                        {/* Provider badge */}
                        {payment.payment_provider && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.payment_provider === 'asaas'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}>
                            {payment.payment_provider === 'asaas' ? 'Asaas' : 'PagBank'}
                          </span>
                        )}

                        {/* Status badge */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status === 'approved' || payment.status === 'pago'
                            ? 'Aprovado'
                            : payment.status === 'pending' || payment.status === 'pendente'
                            ? 'Pendente'
                            : payment.status === 'cancelled' || payment.status === 'cancelado'
                            ? 'Cancelado'
                            : payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
