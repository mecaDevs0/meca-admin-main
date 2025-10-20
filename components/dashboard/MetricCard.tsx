'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor: string
  borderColor: string
  valueColor: string
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  borderColor,
  valueColor,
  trend,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`bg-white rounded-3xl shadow-sm p-8 border-l-4 ${borderColor} hover:shadow-xl transition-all duration-300 group cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.1 }}
            className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3"
          >
            {title}
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.2 }}
            className={`text-4xl font-bold ${valueColor} mb-2`}
          >
            {value}
          </motion.p>

          {trend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}

          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, delay: delay + 0.4 }}
            className="w-full h-1 bg-gradient-to-r from-[#00c977] to-[#00b369] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: delay + 0.2
          }}
          whileHover={{ 
            scale: 1.1, 
            rotate: 5,
            transition: { duration: 0.2 }
          }}
          className={`${iconBgColor} p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MetricCard

