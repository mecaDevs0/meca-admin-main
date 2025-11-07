'use client'

import Sidebar from '@/components/layout/Sidebar'
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
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <OnboardingTour />
      <Sidebar />
      <main 
        className="flex-1 overflow-x-hidden transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '240px' }}
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