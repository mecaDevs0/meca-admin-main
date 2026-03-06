'use client'

import Sidebar from '@/components/layout/Sidebar'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { showToast } from '@/lib/toast'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

// Função para verificar se token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) {
      const expirationTime = payload.exp * 1000 // Converter para milissegundos
      return Date.now() >= expirationTime
    }
    return false
  } catch {
    return true // Se não conseguir decodificar, considerar expirado
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }

    // Verificar se token está expirado
    if (isTokenExpired(token)) {
      localStorage.removeItem('meca_admin_token')
      showToast.warning(
        'Sessão expirada',
        'Sua sessão expirou. Por favor, faça login novamente.'
      )
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return
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