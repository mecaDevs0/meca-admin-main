/**
 * MECA Admin - API Client
 * Cliente para comunicação com a API MECA
 */

import { showToast } from './toast'

// Função para obter URL da API baseado no hostname (executada em runtime)
const getApiUrl = (): string => {
  // Em runtime no cliente, detectar se está em produção
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'admin.mecabr.com') {
      // Usar proxy interno via HTTPS do admin (evita mixed content)
      return `${window.location.protocol}//${window.location.host}/api-proxy`
    }
  }
  // Fallback: usar variável de ambiente ou HTTPS padrão (produção)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return 'https://api.mecabr.com'
}

// Passar a função para ser executada em runtime em cada request

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
  status?: number
}

class MecaApiClient {
  private baseUrl: string | (() => string)
  private token: string | null = null
  private onTokenExpired?: () => void

  constructor(baseUrl: string | (() => string)) {
    this.baseUrl = baseUrl
    
    // Configurar callback para quando token expirar
    if (typeof window !== 'undefined') {
      this.onTokenExpired = () => {
        // Limpar token
        localStorage.removeItem('meca_admin_token')
        this.token = null
        
        // Mostrar mensagem
        showToast.warning(
          'Sessão expirada',
          'Sua sessão expirou. Redirecionando para login...'
        )
        
        // Redirecionar para login após um pequeno delay
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login'
          }
        }, 2000)
      }
    }
  }
  
  // Método para obter a URL atual (útil para debug)
  getBaseUrl(): string {
    return typeof this.baseUrl === 'function' ? this.baseUrl() : this.baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  // Método para verificar se erro é de token expirado
  private isTokenExpiredError(error: string, status?: number): boolean {
    if (status === 401) return true
    
    const normalized = error?.toLowerCase() || ''
    return (
      normalized.includes('jwt expired') ||
      normalized.includes('token expirado') ||
      normalized.includes('token expired') ||
      normalized.includes('unauthorized') ||
      normalized.includes('não autorizado') ||
      normalized.includes('invalid token') ||
      normalized.includes('token inválido')
    )
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    // Resolver URL em runtime para garantir que usa o proxy correto
    const currentBaseUrl = typeof this.baseUrl === 'function' ? this.baseUrl() : this.baseUrl
    const url = `${currentBaseUrl}${endpoint}`
    
    // Debug: log URL em produção para verificar se está usando proxy
    if (typeof window !== 'undefined' && window.location.hostname === 'admin.mecabr.com') {
      console.log('[API Client] Request URL:', url)
    }
    
    try {
      const method = (options.method || 'GET').toUpperCase()
      const response = await fetch(url, {
        ...options,
        headers,
        // Evitar cache em GET para listas (ex.: oficinas com busca) sempre atualizadas
        ...(method === 'GET' && { cache: 'no-store' as RequestCache }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        const errorMessage = errorData.error || errorData.message || 'Request failed'
        
        // Verificar se é erro de token expirado
        if (this.isTokenExpiredError(errorMessage, response.status)) {
          // Chamar callback de token expirado
          if (this.onTokenExpired) {
            this.onTokenExpired()
          }
          
          return {
            error: 'Sessão expirada. Redirecionando para login...',
            success: false,
            status: response.status,
          }
        }
        
        return {
          error: errorMessage,
          success: false,
          status: response.status,
        }
      }

      const data = await response.json()
      // Se a resposta já tem success, usar esse valor; senão, assumir sucesso
      const success = data.success !== undefined ? data.success : true
      return { data, success, status: response.status }
    } catch (error) {
      console.error('API Request Error:', {
        url,
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof TypeError ? 'TypeError' : 'Unknown',
        baseUrl: this.baseUrl,
        endpoint
      })
      
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? 'Erro de conexão. Verifique se a API está acessível e se o servidor está rodando.'
        : error instanceof Error ? error.message : 'Erro desconhecido'
        
      return { 
        error: errorMessage, 
        success: false 
      }
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async sendLoginCode(email: string) {
    return this.request('/admin/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async loginWithCode(email: string, code: string) {
    return this.request('/admin/auth/login-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  }

  async setupPassword(token: string, password: string) {
    return this.request('/admin/auth/setup-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  async forgotPassword(email: string) {
    return this.request('/admin/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request('/admin/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // Dashboard Metrics
  async getDashboardMetrics(period = '30d') {
    return this.request(`/admin/dashboard-metrics?period=${period}`)
  }

  // Vehicles
  async listVehicles(page = 1, limit = 25, search = '', brand = '') {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    if (brand) params.set('brand', brand)
    return this.request(`/admin/vehicles?${params}`)
  }

  async getVehicle(id: string) {
    return this.request(`/admin/vehicles/${id}`)
  }

  async updateVehicle(id: string, data: Record<string, any>) {
    return this.request(`/admin/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async deleteVehicle(id: string) {
    return this.request(`/admin/vehicles/${id}`, { method: 'DELETE' })
  }

  // Analytics
  async getAnalyticsFinancial(period = '30d') {
    return this.request(`/admin/analytics/financial?period=${period}`)
  }

  async getAnalyticsGrowth(period = '30d') {
    return this.request(`/admin/analytics/growth?period=${period}`)
  }

  // Workshops
  async getWorkshops(status?: string, search?: string) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (search && search.trim()) params.append('q', search.trim())
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/admin/workshops${query}`)
  }

  async getWorkshop(id: string) {
    return this.request(`/admin/workshops/${id}`)
  }

  async updateWorkshop(id: string, data: any) {
    return this.request(`/admin/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async disableWorkshop(id: string, reason: string, details?: string) {
    return this.request(`/admin/workshops/${id}/disable`, {
      method: 'PUT',
      body: JSON.stringify({ reason, details: details || '' }),
    })
  }

  async uploadWorkshopLogo(id: string, base64DataUrl: string) {
    return this.request(`/workshop/${id}/logo`, {
      method: 'POST',
      body: JSON.stringify({ logo_base64: base64DataUrl }),
    })
  }

  async removeWorkshopLogo(id: string) {
    return this.request(`/workshop/${id}/logo`, {
      method: 'DELETE',
    })
  }

  async getMecaFeeSettings(params?: { workshopId?: string }) {
    const query = params?.workshopId ? `?workshopId=${params.workshopId}` : ''
    return this.request(`/admin/settings/meca-fee${query}`)
  }

  async updateMecaFeeSettings(data: {
    global_fee?: number
    workshop_id?: string
    workshop_fee?: number | null
  }) {
    return this.request('/admin/settings/meca-fee', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async approveWorkshop(id: string) {
    return this.request(`/admin/workshops/${id}/approve`, {
      method: 'PUT',
    })
  }

  async rejectWorkshop(id: string, reason: string) {
    return this.request(`/admin/workshops/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    })
  }

  // Services
  async getServices() {
    return this.request('/services')
  }

  async createService(data: { name: string; description?: string; category?: string }) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateService(id: string, data: { name?: string; description?: string; category?: string }) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    })
  }

  // Users/Customers
  async getUsers(type?: 'customer' | 'workshop') {
    if (type === 'customer') {
      return this.request('/customers')
    } else if (type === 'workshop') {
      return this.request('/admin/workshops')
    }
    return this.request('/customers')
  }

  async getCustomers(filters?: { search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams()
    if (filters?.search) query.append('search', filters.search)
    if (filters?.limit) query.append('limit', filters.limit.toString())
    if (filters?.offset) query.append('offset', filters.offset.toString())
    const queryString = query.toString()
    return this.request(`/customers${queryString ? `?${queryString}` : ''}`)
  }

  // Bookings
  async getBookings(status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request(`/admin/bookings${query}`)
  }

  async updateBookingStatus(id: string, status: string) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Notifications
  async sendNotification(data: {
    title: string
    message: string
    customer_ids?: string[]
    workshop_ids?: string[]
    target: 'all' | 'customers' | 'workshops' | 'specific'
  }) {
    return this.request('/admin/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getNotifications(filters?: { limit?: number; offset?: number }) {
    const query = new URLSearchParams()
    if (filters?.limit) query.append('limit', filters.limit.toString())
    if (filters?.offset) query.append('offset', filters.offset.toString())
    const queryString = query.toString()
    return this.request(`/admin/notifications${queryString ? `?${queryString}` : ''}`)
  }

  // API Health
  async checkHealth() {
    return this.request('/health')
  }

  // Delete test customers
  async deleteTestCustomers() {
    return this.request('/admin/customers/test', {
      method: 'DELETE',
    })
  }

  // Reports
  async getWorkshopsMonthlyReport(params?: {
    month?: string
    year?: string
    start_date?: string
    end_date?: string
    workshop_id?: string
  }) {
    const query = new URLSearchParams()
    if (params?.month) query.append('month', params.month)
    if (params?.year) query.append('year', params.year)
    if (params?.start_date) query.append('start_date', params.start_date)
    if (params?.end_date) query.append('end_date', params.end_date)
    if (params?.workshop_id) query.append('workshop_id', params.workshop_id)
    const queryString = query.toString()
    return this.request(`/admin/workshops/monthly-report${queryString ? `?${queryString}` : ''}`)
  }
}

// Passar a função diretamente para que seja executada em runtime no cliente
// Criar cliente com URL detectada em runtime
export const apiClient = new MecaApiClient(() => getApiUrl())