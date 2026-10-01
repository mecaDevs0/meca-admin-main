'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  gradient: string
  delta?: number
  sparkData?: number[]
  onClick?: () => void
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const display = useTransform(motionVal, (v) => {
    if (value >= 1000) return Math.round(v).toLocaleString('pt-BR')
    if (Number.isInteger(value)) return Math.round(v).toString()
    return v.toFixed(1)
  })

  useEffect(() => {
    const ctrl = animate(motionVal, value, { duration: 0.8, ease: 'easeOut' })
    return ctrl.stop
  }, [value, motionVal])

  return <motion.span ref={ref}>{display}</motion.span>
}

export function StatCard({ label, value, sub, icon: Icon, gradient, delta, sparkData, onClick }: StatCardProps) {
  const isNumeric = typeof value === 'number'
  const chartData = sparkData?.map((v) => ({ v }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Sparkline background */}
      {chartData && chartData.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c977" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00c977" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#00c977"
                strokeWidth={1.5}
                fill={`url(#spark-${label})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {delta !== undefined && delta !== 0 && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold ${delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-xl sm:text-2xl font-bold text-[#252940] dark:text-white">
          {isNumeric ? <AnimatedNumber value={value} /> : value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
        )}
      </div>
    </motion.div>
  )
}
