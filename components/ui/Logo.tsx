'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  variant?: 'icon' | 'wordmark' | 'full'
  color?: 'white' | 'green'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'icon', 
  color = 'green', 
  size = 'md',
  animated = false 
}) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 }
  }

  const dimensions = sizeMap[size]

  const getLogoPath = () => {
    if (variant === 'icon') {
      return color === 'white' 
        ? '/assets/logos/icone_branco.png' 
        : '/assets/logos/icone_verde.png'
    }
    
    if (variant === 'wordmark') {
      return color === 'white'
        ? '/assets/logos/wordmark_branco.png'
        : '/assets/logos/wordmark_verde.png'
    }
    
    // full variant
    return color === 'white'
      ? '/assets/logos/wordmark_branco_vertica.png'
      : '/assets/logos/wordmark_verde_vertical.png'
  }

  const logoElement = (
    <Image
      src={getLogoPath()}
      alt="MECA Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      priority
    />
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          duration: 0.6
        }}
        whileHover={{ scale: 1.05 }}
        className="inline-block"
      >
        {logoElement}
      </motion.div>
    )
  }

  return logoElement
}

export default Logo

