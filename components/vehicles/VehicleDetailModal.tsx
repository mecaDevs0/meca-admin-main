'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

interface VehicleDetailModalProps {
  vehicle: any
  onClose: () => void
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  concluido:    { icon: CheckCircle, color: 'text-green-400',  label: 'Concluído' },
  cancelado:    { icon: XCircle,     color: 'text-red-400',    label: 'Cancelado' },
  pendente:     { icon: Clock,       color: 'text-yellow-400', label: 'Pendente' },
  em_andamento: { icon: Clock,       color: 'text-blue-400',   label: 'Em andamento' },
}

export function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const v = vehicle?.vehicle
  const bookings = vehicle?.bookings_last_5 || []

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#252940] dark:text-white">{v?.brand} {v?.model}</h2>
                <span className="text-xs bg-[#00c977]/20 text-[#00c977] px-2 py-0.5 rounded-full font-mono">{v?.plate}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Ano', value: v?.year },
              { label: 'Cor', value: v?.color || '—' },
              { label: 'Combustível', value: v?.fuel_type || '—' },
              { label: 'Placa', value: v?.plate },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-[#252940] dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#00c977]/10 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00c977]/20 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-[#00c977]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#252940] dark:text-white">{v?.customer_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{v?.customer_email}</p>
              {v?.customer_phone && <p className="text-xs text-gray-500 dark:text-gray-400">{v?.customer_phone}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00c977]" />
              Últimos 5 agendamentos
            </h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum agendamento encontrado</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b: any) => {
                  const s = statusConfig[b.status] || statusConfig.pendente
                  return (
                    <div key={b.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-xs font-medium text-[#252940] dark:text-white">{b.oficina_name || '—'}</p>
                        <p className="text-xs text-gray-400">{b.service_name || '—'} · {new Date(b.appointment_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                        {b.payment_amount && (
                          <p className="text-xs text-gray-400">R$ {(b.payment_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
