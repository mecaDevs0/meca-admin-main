'use client'

import { apiClient } from '@/lib/api'
import { formatPhone } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Car, ClipboardList, Copy, Mail, Phone, ShieldCheck, ShieldOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: string
  plate: string
  color?: string
}

interface Booking {
  id: string
  status: string
  appointment_date: string
  service_name?: string
  oficina_name?: string
  quote_final?: number
}

interface Props {
  user: { id: string; name: string; email: string; phone: string; type: string; created_at: string; is_active?: boolean }
  onClose: () => void
  onStatusChange?: () => void
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export default function UserDetailModal({ user, onClose, onStatusChange }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isActive, setIsActive] = useState(user.is_active !== false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    loadDetails()
  }, [user.id])

  const loadDetails = async () => {
    setLoading(true)
    const [vehiclesRes, bookingsRes] = await Promise.all([
      apiClient.getCustomerVehicles(user.id).catch(() => ({ data: null, error: null })),
      apiClient.getCustomerBookings(user.id).catch(() => ({ data: null, error: null })),
    ])

    if (vehiclesRes.data) {
      const raw = vehiclesRes.data as any
      const arr = raw?.vehicles ?? raw?.data?.vehicles ?? raw?.data ?? []
      setVehicles(Array.isArray(arr) ? arr : [])
    }

    if (bookingsRes.data) {
      const raw = bookingsRes.data as any
      const arr = raw?.appointments ?? raw?.bookings ?? raw?.data?.appointments ?? raw?.data ?? []
      setBookings(Array.isArray(arr) ? arr : [])
    }

    setLoading(false)
  }

  const handleToggleActive = async () => {
    setToggling(true)
    const { data, error } = await apiClient.toggleCustomerActive(user.id)
    if (error) {
      setToggling(false)
      return
    }
    const result = data as { is_active: boolean }
    setIsActive(result.is_active)
    setToggling(false)
    onStatusChange?.()
  }

  const totalSpent = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.quote_final ?? 0), 0)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {user.name}
                {!isActive && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Inativo</span>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user.type === 'customer' ? 'Cliente' : 'Oficina'} · Cadastro em {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user.type === 'customer' && (
                <button
                  onClick={handleToggleActive}
                  disabled={toggling}
                  aria-label={isActive ? 'Desativar conta' : 'Ativar conta'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                  }`}
                >
                  {toggling ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isActive ? (
                    <ShieldOff className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  {isActive ? 'Desativar' : 'Ativar'}
                </button>
              )}
              <button onClick={onClose} aria-label="Fechar" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-900 dark:text-white truncate">{user.email}</span>
                <button onClick={() => copyToClipboard(user.email)} aria-label="Copiar email" className="ml-auto text-gray-400 hover:text-[#00c977] transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-900 dark:text-white">{formatPhone(user.phone)}</span>
                <button onClick={() => copyToClipboard(user.phone)} aria-label="Copiar telefone" className="ml-auto text-gray-400 hover:text-[#00c977] transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Agendamentos</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Veículos</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{vehicles.length}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Gasto</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent / 100)}
                    </p>
                  </div>
                </div>

                {/* Vehicles */}
                {vehicles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                      <Car className="w-4 h-4" /> Veículos
                    </h3>
                    <div className="space-y-2">
                      {vehicles.map(v => (
                        <div key={v.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-2.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {v.brand} {v.model} {v.year}
                          </span>
                          <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                            {v.plate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bookings */}
                {bookings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4" /> Histórico de Agendamentos
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {bookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {b.service_name || 'Serviço'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(b.appointment_date).toLocaleDateString('pt-BR')}
                              {b.oficina_name && ` · ${b.oficina_name}`}
                            </p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const styles =
    s === 'completed' || s === 'finalizado'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : s === 'cancelled' || s === 'cancelado'
      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      : s === 'pending' || s === 'pendente'
      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'

  const label =
    s === 'completed' || s === 'finalizado' ? 'Finalizado'
    : s === 'cancelled' || s === 'cancelado' ? 'Cancelado'
    : s === 'pending' || s === 'pendente' ? 'Pendente'
    : s === 'confirmed' || s === 'confirmado' ? 'Confirmado'
    : s === 'in_progress' || s === 'em_andamento' ? 'Em Andamento'
    : status

  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${styles}`}>{label}</span>
}
