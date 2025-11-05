'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, XCircle } from 'lucide-react'
import React from 'react'

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  reason: string
  onReasonChange: (reason: string) => void
}

const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reason,
  onReasonChange,
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { duration: 2, repeat: Infinity }
              }}
              className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl"
            >
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-[#252940] dark:text-white">Rejeitar Oficina</h3>
              <p className="text-gray-600 dark:text-gray-400">Esta ação não pode ser desfeita</p>
            </div>
          </div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
                Por favor, informe o motivo da rejeição para que a oficina possa corrigir os problemas identificados.
              </p>
            </div>
          </motion.div>
          
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Motivo da Rejeição *
              </label>
              <motion.textarea
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 h-32 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 resize-none bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Ex: Documentação incompleta, dados incorretos, informações faltando, etc."
                required
              />
            </div>
            
            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={!reason.trim()}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 flex items-center justify-center gap-3"
              >
                <XCircle className="w-5 h-5" />
                Confirmar Rejeição
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold transition-all duration-300"
              >
                Cancelar
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RejectModal

