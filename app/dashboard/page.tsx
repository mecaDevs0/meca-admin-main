'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'
import { motion } from 'framer-motion'
import {
  Building2,
  Clock,
  Users,
  Bell,
  Activity,
  DollarSign
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardMetrics {
  total_customers: number
  customers_this_week: number
  new_users_this_month: number
  active_customers: number
  total_oficinas: number
  workshops_this_week: number
  new_workshops_this_month: number
  active_workshops: number
  oficinas_by_status: {
    pendente?: number
    aprovado?: number
    rejeitado?: number
  }
  revenue_this_month: number
  customer_registrations: Array<{ name: string; value: number }>
  workshop_registrations: Array<{ name: string; value: number }>
  total_bookings_last_month: number
  total_revenue_last_month: number
  meca_commission_last_month: number
}

const COLORS = ['#00c977', '#252940', '#f59e0b', '#ef4444', '#3b82f6']

const DEFAULT_METRICS: DashboardMetrics = {
  total_customers: 0,
  customers_this_week: 0,
  new_users_this_month: 0,
  active_customers: 0,
  total_oficinas: 0,
  workshops_this_week: 0,
  new_workshops_this_month: 0,
  active_workshops: 0,
  oficinas_by_status: {},
  revenue_this_month: 0,
  customer_registrations: [],
  workshop_registrations: [],
  total_bookings_last_month: 0,
  total_revenue_last_month: 0,
  meca_commission_last_month: 0,
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadMetrics()
  }, [router])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data: response, error } = await apiClient.getDashboardMetrics()

      if (error) {
        showToast.error('Erro ao carregar métricas', error || 'Não foi possível carregar os dados')
        setMetrics(null)
        setLoading(false)
        return
      }

      const rawMetrics = (response && typeof response === 'object' && 'data' in response)
        ? (response as { data?: unknown }).data
        : response

      const metricsData = (rawMetrics && typeof rawMetrics === 'object'
        ? rawMetrics
        : {}) as Partial<DashboardMetrics>

      // Garantir que os arrays de registros existam
      const finalMetrics: DashboardMetrics = {
        ...DEFAULT_METRICS,
        ...metricsData,
        customer_registrations: metricsData.customer_registrations || [],
        workshop_registrations: metricsData.workshop_registrations || []
      }
      
      setMetrics(finalMetrics)
    } catch (error) {
      console.error('Erro na requisição:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setMetrics(null)
    }

    setLoading(false)
  }

  const handleApproveWorkshops = () => {
    router.push('/dashboard/workshops?status=pending')
  }

  const handleSendNotifications = () => {
    router.push('/dashboard/notifications')
  }

  const handleViewAPI = () => {
    router.push('/dashboard/api-status')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (loading) {
    return <Loading message="Carregando métricas..." size={200} />
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">Não foi possível carregar as métricas</h3>
          <p className="text-gray-600 dark:text-gray-400">Verifique a conexão com a API e tente novamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1920px] mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6" data-onboard="dashboard">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Acompanhe as principais métricas do marketplace</p>
        </motion.div>

        {/* Seção de Ações Rápidas */}
        <motion.div variants={itemVariants} className="mb-6" data-onboard="quick-actions">
          <h2 className="text-xl font-bold text-[#252940] dark:text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1 - Aprovar Oficinas */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border-2 border-[#00c977]/50 dark:border-[#00c977]/50 shadow-lg flex items-center gap-4 cursor-pointer"
              onClick={handleApproveWorkshops}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#00c977] dark:text-[#00c977] truncate">Aprovar Oficinas</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Gerencie oficinas pendentes</p>
              </div>
            </motion.div>

            {/* Card 2 - Enviar Notificações */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border-2 border-gray-400/50 dark:border-gray-500/50 shadow-lg flex items-center gap-4 cursor-pointer"
              onClick={handleSendNotifications}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#00c977] dark:text-[#00c977] truncate">Enviar Notificações</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Comunique-se com usuários</p>
              </div>
            </motion.div>

            {/* Card 3 - Status da API */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border-2 border-blue-500/50 dark:border-blue-400/50 shadow-lg flex items-center gap-4 cursor-pointer"
              onClick={handleViewAPI}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#00c977] dark:text-[#00c977] truncate">Status da API</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Monitore a saúde da API</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bento Grid Layout - 5 cards (3 superiores, 2 inferiores) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* Row 1: 3 Metric Cards */}
          
          {/* Card 1 - Clientes */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total de Clientes</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">{metrics.total_customers || 0}</p>
              <div className="pt-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Novos este mês</span>
                  <span className="font-semibold text-[#252940] dark:text-white">{metrics.new_users_this_month || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Ativos (3 meses)</span>
                  <span className="font-semibold text-[#252940] dark:text-white">{metrics.active_customers || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Card 2 - Oficinas */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total de Oficinas</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">{metrics.total_oficinas || 0}</p>
              <div className="pt-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Novas este mês</span>
                  <span className="font-semibold text-[#252940] dark:text-white">{metrics.new_workshops_this_month || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Ativas (3 meses)</span>
                  <span className="font-semibold text-[#252940] dark:text-white">{metrics.active_workshops || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Card 3 - Receita do Mês */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Receita do Mês</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">
                R$ {(metrics.revenue_this_month || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total de pagamentos aprovados</p>
              </div>
            </div>
          </motion.div>
          
          {/* Card 4 - Pendentes (Clicável) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={handleApproveWorkshops}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Oficinas Pendentes</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">{metrics.oficinas_by_status?.pendente || 0}</p>
              <div className="pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Clique para aprovar ou rejeitar</p>
              </div>
            </div>
          </motion.div>
          
        </div>

        {/* Gráficos e demais cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Chart 1 - Registro de Clientes (últimos 6 meses) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -2, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
            data-onboard="client-chart"
          >
            <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-4">Registro de Clientes (6 meses)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.customer_registrations && metrics.customer_registrations.length > 0 ? metrics.customer_registrations.map((item: any) => ({
                name: item.name || item.month || 'N/A',
                value: item.value || item.count || 0
              })) : [
                { name: 'Jan', value: 0 },
                { name: 'Fev', value: 0 },
                { name: 'Mar', value: 0 },
                { name: 'Abr', value: 0 },
                { name: 'Mai', value: 0 },
                { name: 'Jun', value: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-400" fontSize={12} />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229, 231, 235, 0.5)', 
                    borderRadius: '12px',
                    padding: '8px 12px',
                    color: '#111827'
                  }}
                  labelStyle={{ color: '#6b7280', fontWeight: 600 }}
                  itemStyle={{ color: '#111827' }}
                />
                <Bar dataKey="value" name="Clientes" fill="#00c977" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Chart 2 - Registro de Oficinas (últimos 6 meses) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -2, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-4">Registro de Oficinas (6 meses)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.workshop_registrations && metrics.workshop_registrations.length > 0 ? metrics.workshop_registrations.map((item: any) => ({
                name: item.name || item.month || 'N/A',
                value: item.value || item.count || 0
              })) : [
                { name: 'Jan', value: 0 },
                { name: 'Fev', value: 0 },
                { name: 'Mar', value: 0 },
                { name: 'Abr', value: 0 },
                { name: 'Mai', value: 0 },
                { name: 'Jun', value: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-400" fontSize={12} />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229, 231, 235, 0.5)', 
                    borderRadius: '12px',
                    padding: '8px 12px',
                    color: '#111827'
                  }}
                  labelStyle={{ color: '#6b7280', fontWeight: 600 }}
                  itemStyle={{ color: '#111827' }}
                />
                <Bar dataKey="value" name="Oficinas" fill="#252940" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}
