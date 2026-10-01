'use client'

import { motion } from 'framer-motion'

function Bone({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} style={style} />
  )
}

export function KpiSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
        >
          <Bone className="w-9 h-9 rounded-xl mb-3" />
          <Bone className="w-20 h-7 mb-2" />
          <Bone className="w-16 h-3 mb-1" />
          <Bone className="w-24 h-2.5" />
        </motion.div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-700/50">
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className={`h-3 ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-24'}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <motion.div
          key={row}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: row * 0.03 }}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Bone
              key={col}
              className={`h-4 ${col === 0 ? 'w-36' : col === 1 ? 'w-28' : col === cols - 1 ? 'w-20' : 'w-24'}`}
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-sm"
    >
      <Bone className="w-48 h-5 mb-4" />
      <div className="flex items-end gap-2" style={{ height }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Bone
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Bone key={i} className="w-8 h-2.5" />
        ))}
      </div>
    </motion.div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Bone className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Bone className="w-32 h-4 mb-2" />
          <Bone className="w-20 h-3" />
        </div>
      </div>
      <Bone className="w-full h-3 mb-2" />
      <Bone className="w-3/4 h-3" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Bone className="w-48 h-8 mb-2" />
            <Bone className="w-64 h-4" />
          </div>
          <Bone className="w-32 h-9 rounded-lg" />
        </div>
        <KpiSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    </div>
  )
}
