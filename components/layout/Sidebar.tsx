'use client'

import Logo from '@/components/ui/Logo'
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
    User,
    Users,
    Wrench
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('meca_admin_token')
    router.push('/login')
  }

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
    },
    { 
      name: 'Oficinas', 
      path: '/dashboard/workshops', 
      icon: Building2,
    },
    { 
      name: 'Serviços', 
      path: '/dashboard/services', 
      icon: Wrench,
    },
    { 
      name: 'Notificações', 
      path: '/dashboard/notifications', 
      icon: Bell,
    },
    { 
      name: 'Usuários', 
      path: '/dashboard/users', 
      icon: Users,
    },
    { 
      name: 'Relatórios', 
      path: '/dashboard/reports', 
      icon: FileText,
    },
    { 
      name: 'Status API', 
      path: '/dashboard/api-status', 
      icon: Activity,
    },
    { 
      name: 'Teste API', 
      path: '/test-api', 
      icon: Activity,
    },
    { 
      name: 'Perfil', 
      path: '/dashboard/profile', 
      icon: User,
    },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed ? 60 : 200,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      className="fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800 z-50"
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Logo variant="icon" color="white" size="sm" />
              <span className="text-sm font-medium">MECA</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Logo variant="icon" color="white" size="sm" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors ${
              isActive(item.path)
                ? 'bg-[#00c977] text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
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
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
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
        </button>
      </div>
    </motion.aside>
  )
}



