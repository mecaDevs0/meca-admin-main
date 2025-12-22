'use client'

import {
  Building2,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  XCircle,
  Edit,
  Percent
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Workshop {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
  meca_fee_percentage?: number | null
  logo_url?: string | null
}

interface WorkshopCardProps {
  workshop: Workshop
  onApprove: (id: string) => void
  onReject: (id: string) => void
  delay?: number
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ 
  workshop, 
  onApprove, 
  onReject
}) => {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
        icon: Clock,
        label: 'PENDENTE'
      },
      aprovado: {
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
        icon: CheckCircle,
        label: 'APROVADO'
      },
      rejeitado: {
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        icon: XCircle,
        label: 'REJEITADO'
      },
    }
    return configs[status as keyof typeof configs] || configs.pendente
  }

  const statusConfig = getStatusConfig(workshop.status)
  const StatusIcon = statusConfig.icon

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsApproving(true)
    try {
      await onApprove(workshop.id)
    } finally {
      setTimeout(() => setIsApproving(false), 1000)
    }
  }

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation()
    onReject(workshop.id)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Não navegar se clicar nos botões
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('motion.button')) {
      return
    }
    router.push(`/dashboard/workshops/edit/${workshop.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={handleCardClick}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6 cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Informações Principais */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            {workshop.logo_url && workshop.logo_url.trim() !== '' && workshop.logo_url.startsWith('http') && !logoError ? (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                <img
                  src={workshop.logo_url}
                  alt={workshop.name}
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{workshop.name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${statusConfig.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{workshop.cnpj}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{workshop.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{workshop.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{workshop.address}</span>
            </div>
            {typeof workshop.meca_fee_percentage === 'number' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Percent className="w-4 h-4 flex-shrink-0" />
                <span>
                  Taxa MECA personalizada:{' '}
                  <span className="font-semibold text-[#00c977] dark:text-[#4ade80]">
                    {(workshop.meca_fee_percentage * 100).toFixed(2)}%
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 lg:w-auto w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/workshops/edit/${workshop.id}`)
            }}
            className="bg-gradient-to-r from-[#252940] to-[#1B1D2E] hover:from-[#1B1D2E] hover:to-[#252940] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl dark:from-gray-700 dark:to-gray-800"
          >
            <Edit className="w-4 h-4" />
            Editar
          </motion.button>

          {workshop.status === 'pendente' && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                {isApproving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Aprovar
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default WorkshopCard
