'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-12 h-7 bg-gray-200 rounded-full animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative w-12 h-7 rounded-full p-1 transition-colors duration-300
        ${isDark ? 'bg-gradient-to-r from-[#252940] to-[#1B1D2E]' : 'bg-gradient-to-r from-[#00c977] to-[#00b369]'}
        focus:outline-none focus:ring-2 focus:ring-[#00c977] focus:ring-offset-2
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center"
        animate={{
          x: isDark ? 20 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-[#252940]" />
        ) : (
          <Sun className="w-3 h-3 text-[#00c977]" />
        )}
      </motion.div>
    </motion.button>
  )
}


