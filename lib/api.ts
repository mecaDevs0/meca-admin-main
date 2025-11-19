/**
 * MECA Admin - API Client
 * Cliente para comunicação com a API MECA
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

class MecaApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
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

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        return { error: errorData.error || errorData.message || 'Request failed', success: false }
      }

      const data = await response.json()
      return { data, success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error', success: false }
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
  async getDashboardMetrics() {
    return this.request('/admin/dashboard-metrics')
  }

  // Workshops
  async getWorkshops(status?: string) {
    const query = status ? `?status=${status}` : ''
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
      return this.request('/workshops')
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
}

export const apiClient = new MecaApiClient(API_URL)
