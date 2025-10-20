/**
 * MECA Admin - API Client
 * Cliente para comunicação com a API Medusa
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
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
        const error = await response.text()
        return { error: error || 'Request failed' }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
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

  async approveWorkshop(id: string) {
    return this.request(`/admin/workshops/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectWorkshop(id: string, reason: string) {
    return this.request(`/admin/workshops/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Master Services
  async getMasterServices() {
    return this.request('/admin/master-services')
  }

  async createMasterService(data: { title: string; description?: string; category?: string }) {
    return this.request('/admin/master-services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMasterService(id: string, data: { title?: string; description?: string; category?: string }) {
    return this.request(`/admin/master-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMasterService(id: string) {
    return this.request(`/admin/master-services/${id}`, {
      method: 'DELETE',
    })
  }

  // Users
  async getUsers(type?: 'customer' | 'workshop') {
    const query = type ? `?type=${type}` : ''
    return this.request(`/admin/users${query}`)
  }

  // Notifications
  async sendNotification(data: { title: string; message: string; target: string }) {
    return this.request('/admin/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // API Health
  async checkHealth() {
    return this.request('/health')
  }
}

export const apiClient = new MecaApiClient(API_URL)

