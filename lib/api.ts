/**
 * MECA Admin - API Client
 * Cliente para comunicação com a API MECA
 */

import { Sentry } from './sentry'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mecabr.com'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
  status?: number
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

  private async request<T = any>(
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
        const isAuthEndpoint = endpoint.startsWith('/admin/auth/')
        if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
          localStorage.removeItem('meca_admin_token')
          this.token = null
          window.location.href = '/login'
          return { error: 'Sessão expirada', success: false, status: 401 }
        }
        if (response.status >= 500) {
          Sentry.captureException(new Error(`API ${response.status}: ${endpoint}`), {
            tags: { api_status: response.status },
            extra: { endpoint, method: options.method ?? 'GET' },
          })
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        return {
          error: errorData.error || errorData.message || 'Request failed',
          success: false,
          status: response.status,
        }
      }

      const data = await response.json()
      return { data, success: true, status: response.status }
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

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/admin/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async createAdmin(data: { email: string; name: string }) {
    return this.request('/admin/auth/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Dashboard Metrics
  async getDashboardMetrics(period?: string) {
    const qs = period ? `?period=${period}` : ''
    return this.request(`/admin/dashboard-metrics${qs}`)
  }

  // Workshops
  async getWorkshops(status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request(`/admin/workshops${query}`)
  }

  async getWorkshop(id: string) {
    return this.request(`/admin/workshops/${id}`)
  }

  async getMecaFeeSettings(params: { workshopId: string }) {
    const q = new URLSearchParams({ workshopId: params.workshopId })
    return this.request(`/admin/settings/meca-fee?${q}`)
  }

  async updateMecaFeeSettings(data: { global_fee?: number; workshop_id?: number; workshop_fee?: number }) {
    return this.request('/admin/settings/meca-fee', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateWorkshop(id: string, data: any) {
    return this.request(`/admin/workshops/${id}`, {
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

  async deleteWorkshop(id: string) {
    return this.request(`/admin/workshops/${id}`, {
      method: 'DELETE',
    })
  }

  async hardDeleteWorkshop(id: string) {
    return this.request(`/admin/workshops/${id}/hard-delete`, {
      method: 'DELETE',
    })
  }

  async uploadWorkshopLogo(workshopId: string, logoBase64DataUrl: string) {
    return this.request(`/workshop/${workshopId}/logo`, {
      method: 'POST',
      body: JSON.stringify({ logo_base64: logoBase64DataUrl }),
    })
  }

  async removeWorkshopLogo(workshopId: string) {
    return this.request(`/workshop/${workshopId}/logo`, {
      method: 'DELETE',
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

  async cancelBooking(id: string, reason: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    })
  }

  async refundBooking(id: string, reason: string) {
    return this.request(`/admin/bookings/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async toggleCustomerActive(customerId: string) {
    return this.request(`/admin/customers/${customerId}/toggle-active`, {
      method: 'PATCH',
    })
  }

  async getCustomerVehicles(customerId: string) {
    return this.request(`/vehicles/${customerId}`)
  }

  async getCustomerBookings(customerId: string) {
    return this.request(`/bookings/${customerId}`)
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

  async getNotifications(filters?: { limit?: number; offset?: number; from?: string; to?: string }) {
    const query = new URLSearchParams()
    if (filters?.limit) query.append('limit', filters.limit.toString())
    if (filters?.offset) query.append('offset', filters.offset.toString())
    if (filters?.from) query.append('from', filters.from)
    if (filters?.to) query.append('to', filters.to)
    const queryString = query.toString()
    return this.request(`/admin/notifications${queryString ? `?${queryString}` : ''}`)
  }

  // Promo Codes
  async getPromoCodes(page = 1, limit = 20, active?: boolean) {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (active !== undefined) qs.set('active', String(active))
    return this.request(`/admin/promo-codes?${qs}`)
  }

  async getPromoCodeStats() {
    return this.request('/admin/promo-codes/stats')
  }

  async createPromoCode(data: {
    code: string; description?: string; type?: string; value: number;
    max_uses?: number; min_booking_value?: number; valid_from?: string;
    valid_until?: string; first_booking_only?: boolean
  }) {
    return this.request('/admin/promo-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePromoCode(id: number, data: Record<string, unknown>) {
    return this.request(`/admin/promo-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async togglePromoCode(id: number) {
    return this.request(`/admin/promo-codes/${id}/toggle`, {
      method: 'PUT',
    })
  }

  // Push Campaigns
  async getPushCampaigns(page = 1, limit = 20) {
    return this.request(`/admin/push-campaigns?page=${page}&limit=${limit}`)
  }

  async getPushCampaignSegments() {
    return this.request('/admin/push-campaigns/segments')
  }

  async createPushCampaign(data: { title: string; message: string; segment: string }) {
    return this.request('/admin/push-campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // API Health
  async checkHealth() {
    return this.request('/health')
  }

  // Payments
  async getPayments(filters?: { status?: string; provider?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams()
    if (filters?.status) query.append('status', filters.status)
    if (filters?.provider) query.append('provider', filters.provider)
    if (filters?.startDate) query.append('start_date', filters.startDate)
    if (filters?.endDate) query.append('end_date', filters.endDate)
    const queryString = query.toString()
    return this.request(`/admin/payments${queryString ? `?${queryString}` : ''}`)
  }

  // Financial Analytics
  async getFinancialAnalytics(period?: string) {
    const query = period ? `?period=${period}` : ''
    return this.request(`/admin/analytics/financial${query}`)
  }

  // Reviews
  async getReviews(params?: { page?: number; rating?: number; workshop_id?: string; from?: string; to?: string; hidden?: string }) {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.rating) qs.set('rating', String(params.rating))
    if (params?.workshop_id) qs.set('workshop_id', params.workshop_id)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    if (params?.hidden) qs.set('hidden', params.hidden)
    return this.request(`/admin/reviews?${qs}`)
  }

  async hideReview(id: number, reason: string) {
    return this.request(`/admin/reviews/${id}/hide`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    })
  }

  async unhideReview(id: number) {
    return this.request(`/admin/reviews/${id}/unhide`, {
      method: 'PUT',
    })
  }

  async respondToReview(id: number, response: string) {
    return this.request(`/admin/reviews/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    })
  }

  // Referrals (B2C)
  async getReferralStats() {
    return this.request('/admin/referrals/stats')
  }

  // Marketing (AppsFlyer)
  async getMarketingOverview(period?: string) {
    const qs = period ? `?period=${period}` : ''
    return this.request(`/admin/marketing/overview${qs}`)
  }

  async getMarketingFunnel(period?: string, source?: string) {
    const params = new URLSearchParams()
    if (period) params.set('period', period)
    if (source) params.set('source', source)
    const qs = params.toString()
    return this.request(`/admin/marketing/funnel${qs ? `?${qs}` : ''}`)
  }

  async getMarketingChannels(period?: string) {
    const qs = period ? `?period=${period}` : ''
    return this.request(`/admin/marketing/channels${qs}`)
  }

  async getMarketingAttribution(entityId: string, type: 'customer' | 'workshop' = 'customer') {
    return this.request(`/admin/marketing/attribution/${entityId}?type=${type}`)
  }

  async syncMarketingData(days?: number) {
    const qs = days ? `?days=${days}` : ''
    return this.request(`/admin/marketing/sync${qs}`, { method: 'POST' })
  }

  // Audit Log
  async getAuditLog(params?: { page?: number; action?: string; admin?: string; from?: string; to?: string }) {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.action) qs.set('action', params.action)
    if (params?.admin) qs.set('admin', params.admin)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    return this.request(`/admin/audit-log?${qs}`)
  }
}

export const apiClient = new MecaApiClient(API_URL)
