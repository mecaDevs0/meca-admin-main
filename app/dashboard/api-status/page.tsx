'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { Activity, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ApiStatus {
  endpoint: string
  path: string
  status: 'online' | 'offline'
  responseTime?: number
  lastCheck: string
  error?: string
}

interface TestResult {
  name: string
  success: boolean
  data?: any
  error?: string
  responseTime?: number
}

export default function ApiStatusPage() {
  const router = useRouter()
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [activeTab, setActiveTab] = useState<'status' | 'test'>('status')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    checkApiStatus()
  }, [router])

  const checkApiStatus = async () => {
    setLoading(true)
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://18.222.129.59:9000'
    
    const endpoints = [
      { name: 'Dashboard Metrics', path: '/admin/dashboard-metrics' },
      { name: 'Workshops', path: '/admin/workshops' },
      { name: 'Bookings', path: '/admin/bookings' },
      { name: 'Customers', path: '/customers' },
      { name: 'Services', path: '/services' },
      { name: 'Health Check', path: '/health' },
    ]

    const statuses: ApiStatus[] = []

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now()
        const token = localStorage.getItem('meca_admin_token')
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
        
        const response = await fetch(`${API_URL}${endpoint.path}`, { 
          method: 'GET',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime

        // Para endpoints protegidos, considerar online mesmo se retornar 401/403 (API está respondendo)
        const isOnline = response.ok || (response.status === 401 || response.status === 403)

        statuses.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: isOnline ? 'online' : 'offline',
          responseTime,
          lastCheck: new Date().toLocaleString('pt-BR'),
          ...(response.status === 401 || response.status === 403 ? { error: 'Requer autenticação' } : {})
        })
      } catch (error) {
        statuses.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: 'offline',
          lastCheck: new Date().toLocaleString('pt-BR'),
          error: error instanceof Error ? (error.name === 'AbortError' ? 'Timeout na requisição' : error.message) : 'Erro desconhecido'
        })
      }
    }

    setApiStatuses(statuses)
    setLoading(false)
  }

  const testEndpoints = async () => {
    setTesting(true)
    const results: TestResult[] = []

    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        showToast.error('Não autenticado', 'Faça login para continuar')
        router.push('/login')
        return
      }
      apiClient.setToken(token)
      
      // Test health
      const healthStart = Date.now()
      const health = await apiClient.checkHealth()
      const healthTime = Date.now() - healthStart
      results.push({
        name: 'Health Check',
        success: health.success || false,
        data: health.data,
        error: health.error,
        responseTime: healthTime
      })

      // Test workshops
      const workshopsStart = Date.now()
      const workshops = await apiClient.getWorkshops()
      const workshopsTime = Date.now() - workshopsStart
      results.push({
        name: 'Workshops',
        success: workshops.success || false,
        data: workshops.data,
        error: workshops.error,
        responseTime: workshopsTime
      })

      // Test services
      const servicesStart = Date.now()
      const services = await apiClient.getServices()
      const servicesTime = Date.now() - servicesStart
      results.push({
        name: 'Services',
        success: services.success || false,
        data: services.data,
        error: services.error,
        responseTime: servicesTime
      })

      // Test customers
      const customersStart = Date.now()
      const customers = await apiClient.getUsers('customer')
      const customersTime = Date.now() - customersStart
      results.push({
        name: 'Customers',
        success: customers.success || false,
        data: customers.data,
        error: customers.error,
        responseTime: customersTime
      })

      // Test bookings
      const bookingsStart = Date.now()
      const bookings = await apiClient.getBookings()
      const bookingsTime = Date.now() - bookingsStart
      results.push({
        name: 'Bookings',
        success: bookings.success || false,
        data: bookings.data,
        error: bookings.error,
        responseTime: bookingsTime
      })

      // Test dashboard metrics
      const metricsStart = Date.now()
      const metrics = await apiClient.getDashboardMetrics()
      const metricsTime = Date.now() - metricsStart
      results.push({
        name: 'Dashboard Metrics',
        success: metrics.success || false,
        data: metrics.data,
        error: metrics.error,
        responseTime: metricsTime
      })

    } catch (error) {
      console.error('Error testing API:', error)
      results.push({
        name: 'Test Error',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }

    setTestResults(results)
    setTesting(false)
    showToast.success('Testes concluídos', `${results.filter(r => r.success).length} de ${results.length} endpoints funcionando`)
  }

  const getStatusIcon = (status: string) => {
    return status === 'online' || status === 'success' ? (
      <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
    )
  }

  const getStatusColor = (status: string) => {
    return status === 'online' || status === 'success'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
  }

  const overallStatus = apiStatuses.length > 0 && apiStatuses.every(status => status.status === 'online') ? 'online' : 'offline'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1920px] mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Status da API</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Monitoramento e testes dos endpoints da plataforma</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-gray-700/50 shadow-lg">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'status'
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'test'
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              Testes
            </button>
          </div>
        </motion.div>

        {/* Status Tab */}
        {activeTab === 'status' && (
          <>
            {/* Overall Status */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">Status Geral</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Última verificação: {apiStatuses.length > 0 ? apiStatuses[0]?.lastCheck : new Date().toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(overallStatus)}
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(overallStatus)}`}>
                      {overallStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* API Endpoints */}
            {loading ? (
              <Loading message="Verificando endpoints..." size={150} />
            ) : (
              <motion.div variants={itemVariants} className="space-y-4">
                {apiStatuses.map((status, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(status.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-[#252940] dark:text-white">{status.endpoint}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{status.path}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {status.lastCheck}
                            {status.responseTime && ` • ${status.responseTime}ms`}
                          </p>
                          {status.error && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{status.error}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(status.status)}`}>
                        {status.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Refresh Button */}
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <motion.button
                onClick={checkApiStatus}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Verificando...' : 'Verificar Status'}
              </motion.button>
            </motion.div>
          </>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <>
            {/* Test Button */}
            <motion.div variants={itemVariants} className="mb-6 text-center">
              <motion.button
                onClick={testEndpoints}
                disabled={testing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Zap className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                {testing ? 'Testando...' : 'Testar Endpoints'}
              </motion.button>
            </motion.div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-4">
                {testResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(result.success ? 'success' : 'offline')}
                        <div>
                          <h3 className="text-lg font-semibold text-[#252940] dark:text-white">{result.name}</h3>
                          {result.responseTime && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tempo de resposta: {result.responseTime}ms</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(result.success ? 'success' : 'offline')}`}>
                        {result.success ? 'Sucesso' : 'Erro'}
                      </span>
                    </div>
                    
                    {result.error && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <p className="text-sm text-red-600 dark:text-red-400 font-mono">{result.error}</p>
                      </div>
                    )}
                    
                    {result.data && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-[#00c977] dark:hover:text-[#00c977] transition-colors">
                          Ver dados
                        </summary>
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-auto">
                          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

                ))}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
