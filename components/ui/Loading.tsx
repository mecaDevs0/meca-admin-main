'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LoadingProps {
  message?: string
  size?: number
}

export function Loading({ message, size = 120 }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <Image
          src="/assets/animations/AnimacaoLogoVerde.gif"
          alt="MECA Loading"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          unoptimized
        />
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-[#00c977] border-t-transparent rounded-full"
      />
    </div>
  )
}


