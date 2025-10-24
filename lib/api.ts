/**
 * MECA Admin - API Client
 * Cliente para comunicação com a API Medusa
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'

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
    return this.request(`/workshops${query}`)
  }

  async approveWorkshop(id: string) {
    return this.request(`/workshops/${id}/approve`, {
      method: 'PUT',
    })
  }

  async rejectWorkshop(id: string, reason: string) {
    return this.request(`/workshops/${id}/reject`, {
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

  // Bookings
  async getBookings(status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request(`/bookings${query}`)
  }

  async updateBookingStatus(id: string, status: string) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Notifications
  async sendNotification(data: { title: string; message: string; target: string }) {
    return this.request('/notifications/send', {
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

