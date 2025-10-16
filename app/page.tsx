'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#252940] to-[#1B1D2E]">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">MECA Admin</h1>
        <p>Redirecionando...</p>
      </div>
    </div>
  )
}
