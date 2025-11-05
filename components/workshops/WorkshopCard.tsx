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
  Edit
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

interface Workshop {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
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

  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'PENDENTE'
      },
      aprovado: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'APROVADO'
      },
      rejeitado: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'REJEITADO'
      },
    }
    return configs[status as keyof typeof configs] || configs.pendente
  }

  const statusConfig = getStatusConfig(workshop.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl p-4 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{workshop.name}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.color} dark:border-opacity-50`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              <span>{workshop.cnpj}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>{workshop.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{workshop.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{workshop.address}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/workshops/edit/${workshop.id}`)}
            className="bg-gradient-to-r from-[#252940] to-[#1B1D2E] hover:from-[#1B1D2E] hover:to-[#252940] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>

          {workshop.status === 'pendente' && (
            <>
              <button
                onClick={() => onApprove(workshop.id)}
                className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Aprovar
              </button>
              
              <button
                onClick={() => onReject(workshop.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkshopCard
