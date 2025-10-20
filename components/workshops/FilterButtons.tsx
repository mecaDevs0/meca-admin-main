'use client'

import { CheckCircle, Clock, XCircle } from 'lucide-react'
import React from 'react'

interface FilterButtonsProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { 
      key: 'pendente', 
      label: 'Pendentes', 
      color: 'yellow',
      icon: Clock
    },
    { 
      key: 'aprovado', 
      label: 'Aprovadas', 
      color: 'green',
      icon: CheckCircle
    },
    { 
      key: 'rejeitado', 
      label: 'Rejeitadas', 
      color: 'red',
      icon: XCircle
    },
  ]

  const getButtonClasses = (filter: typeof filters[0]) => {
    const isActive = activeFilter === filter.key
    const baseClasses = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
    
    if (isActive) {
      const colorClasses = {
        yellow: 'bg-yellow-500 text-white hover:bg-yellow-600',
        green: 'bg-green-500 text-white hover:bg-green-600',
        red: 'bg-red-500 text-white hover:bg-red-600',
      }
      return `${baseClasses} ${colorClasses[filter.color as keyof typeof colorClasses]}`
    }
    
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={getButtonClasses(filter)}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterButtons


