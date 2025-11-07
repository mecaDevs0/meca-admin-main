'use client'

import Logo from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
    Activity,
    Bell,
    Building2,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
    User,
    Users,
    Wrench
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('meca_admin_token')
    router.push('/login')
  }

  const menuItems: Array<{
    name: string
    path: string
    icon: any
    onboardKey: string
  }> = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
      onboardKey: 'dashboard',
    },
    { 
      name: 'Oficinas', 
      path: '/dashboard/workshops', 
      icon: Building2,
      onboardKey: 'workshops',
    },
    { 
      name: 'Serviços', 
      path: '/dashboard/services', 
      icon: Wrench,
      onboardKey: 'services',
    },
    { 
      name: 'Notificações', 
      path: '/dashboard/notifications', 
      icon: Bell,
      onboardKey: 'notifications',
    },
    { 
      name: 'Usuários', 
      path: '/dashboard/users', 
      icon: Users,
      onboardKey: 'users',
    },
    { 
      name: 'Relatórios', 
      path: '/dashboard/reports', 
      icon: FileText,
      onboardKey: 'reports',
    },
    { 
      name: 'Status API', 
      path: '/dashboard/api-status', 
      icon: Activity,
      onboardKey: 'api-status',
    },
    { 
      name: 'Perfil', 
      path: '/dashboard/profile', 
      icon: User,
      onboardKey: 'profile',
    },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 240,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      className={`fixed left-0 top-0 h-screen flex flex-col border-r shadow-2xl z-50 backdrop-blur-xl rounded-r-3xl transition-colors duration-300 ${
        mounted && theme === 'dark'
          ? 'bg-gradient-to-b from-[#252940] via-[#1B1D2E] to-[#252940] text-white border-white/10'
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 border-gray-200 dark:bg-gradient-to-b dark:from-[#252940] dark:via-[#1B1D2E] dark:to-[#252940] dark:text-white dark:border-white/10'
      }`}
      data-onboard="sidebar"
    >
      {/* Header */}
      <div className={`p-5 border-b flex items-center justify-between backdrop-blur-sm rounded-tr-3xl transition-colors duration-300 ${
        mounted && theme === 'dark'
          ? 'border-white/10'
          : 'border-gray-200 dark:border-white/10'
      }`}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              <Logo variant="full" color="white" size="lg" animated />
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center w-full"
            >
              <Logo variant="icon" color="white" size="md" animated />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2.5 rounded-2xl backdrop-blur-sm transition-all duration-200 ${
            mounted && theme === 'dark'
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20'
          }`}
          whileHover={{ scale: 1.1, rotate: isCollapsed ? 0 : 180 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {menuItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ x: 6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={item.path}
              data-onboard={item.onboardKey}
              className={`flex items-center gap-4 px-5 py-4 rounded-3xl text-sm font-semibold transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-xl shadow-[#00c977]/40'
                  : mounted && theme === 'dark'
                    ? 'text-white/70 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white backdrop-blur-sm'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className={`p-3 border-t transition-colors duration-300 ${
        mounted && theme === 'dark'
          ? 'border-white/10'
          : 'border-gray-200 dark:border-white/10'
      }`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs font-medium transition-colors duration-300 ${
                mounted && theme === 'dark'
                  ? 'text-white/70'
                  : 'text-gray-600 dark:text-white/70'
              }`}
            >
              Tema
            </motion.span>
          )}
          <div data-onboard="theme-toggle" className={isCollapsed ? 'flex justify-center' : ''}>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className={`p-3 border-t transition-colors duration-300 ${
        mounted && theme === 'dark'
          ? 'border-white/10'
          : 'border-gray-200 dark:border-white/10'
      }`}>
        <motion.button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${
            mounted && theme === 'dark'
              ? 'text-white/70 hover:bg-white/10 hover:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
          }`}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-medium"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}



