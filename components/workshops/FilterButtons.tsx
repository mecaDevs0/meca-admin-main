'use client'

import { CheckCircle, Clock, XCircle, List } from 'lucide-react'
import React from 'react'

interface FilterButtonsProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { 
      key: 'all', 
      label: 'Todas', 
      color: 'gray',
      icon: List
    },
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
    const baseClasses = 'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md'
    
    if (isActive) {
      const colorClasses = {
        gray: 'bg-gradient-to-r from-[#252940] to-[#1B1D2E] text-white hover:from-[#1B1D2E] hover:to-[#252940]',
        yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-500',
        green: 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white hover:from-[#00b369] hover:to-[#00a05a]',
        red: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-500',
      }
      return `${baseClasses} ${colorClasses[filter.color as keyof typeof colorClasses]}`
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600`
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-4 mb-6">
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
