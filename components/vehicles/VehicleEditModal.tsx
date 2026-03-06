'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'

interface VehicleEditModalProps {
  vehicle: any
  onClose: () => void
  onSaved: () => void
}

const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/

export function VehicleEditModal({ vehicle, onClose, onSaved }: VehicleEditModalProps) {
  const [form, setForm] = useState({
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    color: vehicle.color || '',
    fuel_type: vehicle.fuel_type || '',
    plate: vehicle.plate || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const plateCleaned = form.plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!PLATE_REGEX.test(plateCleaned)) {
      showToast.error('Placa inválida', 'Use o formato ABC1234 ou ABC1D23')
      return
    }
    setSaving(true)
    const { error } = await apiClient.updateVehicle(vehicle.id, { ...form, plate: plateCleaned })
    setSaving(false)
    if (error) {
      showToast.error('Erro ao salvar', error)
      return
    }
    showToast.success('Veículo atualizado', 'Dados salvos com sucesso')
    onSaved()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#252940] dark:text-white">Editar Veículo</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { key: 'plate',     label: 'Placa',       placeholder: 'ABC1234' },
              { key: 'brand',     label: 'Marca',       placeholder: 'Toyota' },
              { key: 'model',     label: 'Modelo',      placeholder: 'Corolla' },
              { key: 'year',      label: 'Ano',         placeholder: '2020' },
              { key: 'color',     label: 'Cor',         placeholder: 'Prata' },
              { key: 'fuel_type', label: 'Combustível', placeholder: 'Flex' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-[#252940] dark:text-white focus:outline-none focus:border-[#00c977] transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#00c977] to-[#00b369] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-[#00c977]/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
