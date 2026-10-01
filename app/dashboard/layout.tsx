'use client'

import Sidebar from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      window.location.replace('/login/')
      return
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#00c977] focus:text-white focus:font-semibold"
      >
        Pular para o conteúdo
      </a>
      <OnboardingTour />
      <CommandPalette />
      <Sidebar />
      <main
        id="main-content"
        className="flex-1 overflow-x-hidden transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '72px' : '230px' }}
      >
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}
