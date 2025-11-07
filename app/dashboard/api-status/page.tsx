'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
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

export default function ApiStatusPage() {
  const router = useRouter()
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([])
  const [loading, setLoading] = useState(true)

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
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'
    
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
        const response = await fetch(`${API_URL}${endpoint.path}`, { 
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('meca_admin_token')}`,
            'Content-Type': 'application/json',
          }
        })
        const responseTime = Date.now() - startTime

        statuses.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: response.ok ? 'online' : 'offline',
          responseTime,
          lastCheck: new Date().toLocaleString('pt-BR')
        })
      } catch (error) {
        statuses.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: 'offline',
          lastCheck: new Date().toLocaleString('pt-BR'),
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    setApiStatuses(statuses)
    setLoading(false)
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

        {/* Status Content */}
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
      </motion.div>
    </div>
  )
}

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
      </motion.div>
    </div>
  )
}

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
      </motion.div>
    </div>
  )
}

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
      </motion.div>
    </div>
  )
}

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
      </motion.div>
    </div>
  )
}
