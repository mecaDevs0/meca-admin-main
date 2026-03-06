'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'

interface VehicleDeleteModalProps {
  vehicle: any
  onClose: () => void
  onDeleted: () => void
}

export function VehicleDeleteModal({ vehicle, onClose, onDeleted }: VehicleDeleteModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await apiClient.deleteVehicle(vehicle.id)
    setDeleting(false)
    if (error) {
      if (error.includes('agendamento ativo') || error.includes('409')) {
        showToast.error('Não é possível remover', 'Veículo possui agendamento ativo.')
      } else {
        showToast.error('Erro ao remover', error)
      }
      return
    }
    showToast.success('Veículo removido', `${vehicle.brand} ${vehicle.plate} removido com sucesso`)
    onDeleted()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#252940] dark:text-white mb-1">Remover Veículo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja remover <span className="font-semibold text-[#252940] dark:text-white">{vehicle.brand} {vehicle.model} ({vehicle.plate})</span>?
              </p>
              <p className="text-xs text-red-400 mt-2">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
