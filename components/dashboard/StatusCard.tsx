'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import React from 'react'

interface StatusItem {
  label: string
  value: number
  color: string
  icon: React.ComponentType<{ className?: string }>
}

interface StatusCardProps {
  title: string
  items: StatusItem[]
  delay?: number
}

export default function StatusCard({ title, items, delay = 0 }: StatusCardProps) {
  const defaultItems: StatusItem[] = [
    {
      label: 'Aprovadas',
      value: items.find(item => item.label === 'Aprovadas')?.value || 0,
      color: 'text-green-600',
      icon: CheckCircle
    },
    {
      label: 'Pendentes',
      value: items.find(item => item.label === 'Pendentes')?.value || 0,
      color: 'text-yellow-600',
      icon: Clock
    },
    {
      label: 'Rejeitadas',
      value: items.find(item => item.label === 'Rejeitadas')?.value || 0,
      color: 'text-red-600',
      icon: XCircle
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="bg-white rounded-3xl shadow-sm p-8 hover:shadow-xl transition-all duration-300"
    >
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: delay + 0.1 }}
        className="text-2xl font-bold text-[#252940] mb-8"
      >
        {title}
      </motion.h3>
      
      <div className="grid grid-cols-3 gap-8">
        {defaultItems.map((item, index) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.2 + (index * 0.1) }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            className="text-center group cursor-pointer"
          >
            <motion.div 
              whileHover={{ 
                backgroundColor: 'rgba(0, 201, 119, 0.05)',
                transition: { duration: 0.2 }
              }}
              className="bg-gray-50 rounded-2xl p-6 group-hover:bg-[#00c977]/5 transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: delay + 0.3 + (index * 0.1)
                }}
                className="flex justify-center mb-3"
              >
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.4 + (index * 0.1) }}
                className={`text-3xl font-bold ${item.color} mb-2`}
              >
                {item.value}
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.5 + (index * 0.1) }}
                className="text-sm font-semibold text-gray-600 uppercase tracking-wide"
              >
                {item.label}
              </motion.p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

