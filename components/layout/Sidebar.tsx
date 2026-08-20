'use client'

import Logo from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
    Activity,
    Bell,
    Building2,
    CalendarCheck,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Ticket,
    TrendingUp,
    UserPlus,
    ScrollText,
    Settings,
    Star,
    User,
    Users,
    Wrench
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'

interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuSection {
  label: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    label: 'Principal',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Oficinas', path: '/dashboard/workshops', icon: Building2 },
      { name: 'Serviços', path: '/dashboard/services', icon: Wrench },
      { name: 'Agendamentos', path: '/dashboard/bookings', icon: CalendarCheck },
    ],
  },
  {
    label: 'Crescimento',
    items: [
      { name: 'Marketing', path: '/dashboard/marketing', icon: TrendingUp },
      { name: 'Campanhas', path: '/dashboard/campaigns', icon: Megaphone },
      { name: 'Cupons', path: '/dashboard/promo-codes', icon: Ticket },
      { name: 'Indicações', path: '/dashboard/referrals', icon: UserPlus },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { name: 'Notificações', path: '/dashboard/notifications', icon: Bell },
      { name: 'Usuários', path: '/dashboard/users', icon: Users },
      { name: 'Avaliações', path: '/dashboard/reviews', icon: Star },
      { name: 'Relatórios', path: '/dashboard/reports', icon: FileText },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { name: 'Audit Log', path: '/dashboard/audit-log', icon: ScrollText },
      { name: 'Configurações', path: '/dashboard/settings', icon: Settings },
      { name: 'Status API', path: '/dashboard/api-status', icon: Activity },
      { name: 'Perfil', path: '/dashboard/profile', icon: User },
    ],
  },
]

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

  const isActive = (path: string) => pathname === path

  const isDark = mounted && theme === 'dark'

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 72 : 230,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      className={`fixed left-0 top-0 h-screen flex flex-col border-r shadow-2xl z-50 backdrop-blur-xl rounded-r-3xl transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#252940] via-[#1B1D2E] to-[#252940] text-white border-white/10'
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 border-gray-200 dark:bg-gradient-to-b dark:from-[#252940] dark:via-[#1B1D2E] dark:to-[#252940] dark:text-white dark:border-white/10'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between backdrop-blur-sm rounded-tr-3xl transition-colors duration-300 ${
        isDark ? 'border-white/10' : 'border-gray-200 dark:border-white/10'
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
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          className={`p-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
            isDark
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20'
          }`}
          whileHover={{ scale: 1.1 }}
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
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
        {MENU_SECTIONS.map((section, sIdx) => (
          <div key={section.label} className={sIdx > 0 ? 'mt-3' : ''}>
            {/* Section label — only when expanded */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-white/30' : 'text-gray-400 dark:text-white/30'
                  }`}
                >
                  {section.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed: thin divider between groups */}
            {isCollapsed && sIdx > 0 && (
              <div className={`mx-3 mb-2 border-t ${
                isDark ? 'border-white/10' : 'border-gray-200 dark:border-white/10'
              }`} />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.path} className="relative group">
                  <Link
                    href={item.path}
                    aria-label={item.name}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg shadow-[#00c977]/30'
                        : isDark
                          ? 'text-white/70 hover:bg-white/10 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[60] bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className={`px-3 py-2 border-t transition-colors duration-300 ${
        isDark ? 'border-white/10' : 'border-gray-200 dark:border-white/10'
      }`}>
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className={`text-xs font-medium ${
              isDark ? 'text-white/50' : 'text-gray-500 dark:text-white/50'
            }`}>
              Tema
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Logout */}
      <div className={`px-2 py-2 border-t transition-colors duration-300 ${
        isDark ? 'border-white/10' : 'border-gray-200 dark:border-white/10'
      }`}>
        <div className="relative group">
          <button
            onClick={handleLogout}
            aria-label="Sair"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${
              isDark
                ? 'text-white/70 hover:bg-red-500/20 hover:text-red-300'
                : 'text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-white/70 dark:hover:bg-red-500/20 dark:hover:text-red-300'
            }`}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />

            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Tooltip when collapsed */}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[60] bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl">
              Sair
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-white" />
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
