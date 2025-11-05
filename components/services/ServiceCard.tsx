'use client'

import { Edit, Trash2, Wrench } from 'lucide-react'
import React from 'react'

interface MasterService {
  id: string
  title: string
  description?: string
  category?: string
}

interface ServiceCardProps {
  service: MasterService
  onEdit: (service: MasterService) => void
  onDelete: (id: string) => void
  delay?: number
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onEdit, 
  onDelete
}) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl p-4 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-lg flex items-center justify-center shadow-lg">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{service.title}</h3>
            {service.category && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                {service.category}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {service.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{service.description}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(service)}
          className="flex-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-3 h-3" />
          Editar
        </button>
        
        <button
          onClick={() => onDelete(service.id)}
          className="flex-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 py-2 px-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Excluir
        </button>
      </div>
    </div>
  )
}

export default ServiceCard

