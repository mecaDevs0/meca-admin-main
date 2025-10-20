'use client'

import { Activity, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ApiStatus {
  endpoint: string
  status: 'online' | 'offline'
  responseTime?: number
  lastCheck: string
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
    checkApiStatus()
  }, [router])

  const checkApiStatus = async () => {
    setLoading(true)
    
    const endpoints = [
      { name: 'Dashboard Metrics', url: '/api/admin/dashboard-metrics' },
      { name: 'Workshops', url: '/api/admin/workshops' },
      { name: 'Users', url: '/api/admin/users' },
      { name: 'Master Services', url: '/api/admin/master-services' },
      { name: 'Notifications', url: '/api/admin/notifications/send' },
    ]

    const statuses: ApiStatus[] = []

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now()
        const response = await fetch(endpoint.url, { method: 'GET' })
        const responseTime = Date.now() - startTime

        statuses.push({
          endpoint: endpoint.name,
          status: response.ok ? 'online' : 'offline',
          responseTime,
          lastCheck: new Date().toLocaleString('pt-BR')
        })
      } catch (error) {
        statuses.push({
          endpoint: endpoint.name,
          status: 'offline',
          lastCheck: new Date().toLocaleString('pt-BR')
        })
      }
    }

    setApiStatuses(statuses)
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    return status === 'online' ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getStatusColor = (status: string) => {
    return status === 'online' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const overallStatus = apiStatuses.every(status => status.status === 'online') ? 'online' : 'offline'

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Status da API</h1>
            <p className="text-sm text-gray-500">Monitoramento dos endpoints da plataforma</p>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Status Geral</h2>
            <p className="text-sm text-gray-600">Última verificação: {new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(overallStatus)}`}>
              {overallStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {apiStatuses.map((status, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{status.endpoint}</h3>
                    <p className="text-sm text-gray-600">
                      Última verificação: {status.lastCheck}
                      {status.responseTime && ` • ${status.responseTime}ms`}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
                  {status.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={checkApiStatus}
          disabled={loading}
          className="bg-[#00c977] hover:bg-[#00b369] disabled:bg-gray-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Verificando...' : 'Verificar Status'}
        </button>
      </div>
    </div>
  )
}