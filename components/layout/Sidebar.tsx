'use client'

import Logo from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Activity,
    Bell,
    Building2,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
    Percent,
    User,
    Users,
    Wrench
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'

interface SidebarProps {
  collapsed: boolean
  onToggle: (next: boolean) => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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
      name: 'Taxa MECA',
      path: '/dashboard/settings/meca-fee',
      icon: Percent,
      onboardKey: 'meca-fee',
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

  const isActive = (path: string) => pathname === path

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 80 : 240,
        transition: { duration: 0.25, ease: 'easeInOut' },
      }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-[#252940] via-[#1B1D2E] to-[#252940] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white flex flex-col border-r border-white/10 dark:border-gray-800 shadow-2xl z-50 backdrop-blur-xl rounded-r-3xl"
      data-onboard="sidebar"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10 dark:border-gray-800/60 flex items-center justify-between backdrop-blur-sm rounded-tr-3xl">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center"
            >
              <Logo variant="full" color="white" size="lg" animated={false} />
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center w-full"
            >
              <Logo variant="icon" color="white" size="md" animated={false} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => onToggle(!collapsed)}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/60 dark:hover:bg-gray-700/60 backdrop-blur-sm transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              data-onboard={item.onboardKey}
              className={clsx(
                'flex items-center gap-4 px-5 py-4 rounded-3xl text-sm font-semibold transition-all duration-200',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-xl shadow-[#00c977]/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white dark:hover:bg-gray-800/70 backdrop-blur-sm'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />

              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-white/10 dark:border-gray-800/60">
        <div className={clsx('flex items-center gap-3', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && <span className="text-xs font-medium text-white/70">Tema</span>}
          <div data-onboard="theme-toggle" className={collapsed ? 'flex justify-center' : ''}>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/10 dark:border-gray-800/60">
        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white dark:hover:bg-gray-800/70 transition-all duration-200',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </motion.aside>
  )
}



