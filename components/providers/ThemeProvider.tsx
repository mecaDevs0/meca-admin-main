'use client'

import React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <MotionConfig reducedMotion="always">
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </MotionConfig>
  )
}

