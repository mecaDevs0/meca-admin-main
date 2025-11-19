'use client'

import Sidebar from '@/components/layout/Sidebar'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <OnboardingTour />
      <Sidebar collapsed={collapsed} onToggle={setCollapsed} />
      <main
        className={clsx(
          'flex-1 overflow-x-hidden transition-all duration-300 ease-in-out',
          collapsed ? 'ml-[80px]' : 'ml-[240px]'
        )}
      >
        {children}
      </main>
    </div>
  )
}