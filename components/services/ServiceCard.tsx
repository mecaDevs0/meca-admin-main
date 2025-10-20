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
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{service.title}</h3>
            {service.category && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {service.category}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {service.description && (
        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(service)}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-3 h-3" />
          Editar
        </button>
        
        <button
          onClick={() => onDelete(service.id)}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Excluir
        </button>
      </div>
    </div>
  )
}

export default ServiceCard

