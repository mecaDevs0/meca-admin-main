'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (token) {
      router.replace('/dashboard')
    } else {
      setChecked(true)
      router.replace('/login')
    }
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00c977] border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Fallback: if router.replace doesn't work in static export, show login link
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#00c977] border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Carregando...</p>
        <a
          href="/login/"
          className="text-[#00c977] hover:text-[#00b369] font-semibold underline"
        >
          Ir para Login
        </a>
      </div>
    </div>
  )
}
