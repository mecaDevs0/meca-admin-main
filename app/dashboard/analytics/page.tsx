'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { PeriodSelector } from '@/components/analytics/PeriodSelector'
import { FinancialTab } from '@/components/analytics/FinancialTab'
import { GrowthTab } from '@/components/analytics/GrowthTab'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TABS = [
  { key: 'financial', label: 'Financeiro' },
  { key: 'growth',    label: 'Crescimento' },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const [tab, setTab] = useState('financial')
  const [period, setPeriod] = useState('30d')
  const [financialData, setFinancialData] = useState<any>(null)
  const [growthData, setGrowthData] = useState<any>(null)
  const [loadingFinancial, setLoadingFinancial] = useState(false)
  const [loadingGrowth, setLoadingGrowth] = useState(false)

  const loadAll = async (p: string) => {
    setLoadingFinancial(true)
    setLoadingGrowth(true)

    const [fin, gro] = await Promise.all([
      apiClient.getAnalyticsFinancial(p),
      apiClient.getAnalyticsGrowth(p),
    ])

    setLoadingFinancial(false)
    setLoadingGrowth(false)

    if (fin.error) showToast.error('Erro financeiro', fin.error)
    else setFinancialData((fin.data as any)?.data || fin.data)

    if (gro.error) showToast.error('Erro crescimento', gro.error)
    else setGrowthData((gro.data as any)?.data || gro.data)
  }

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { router.push('/login'); return }
    apiClient.setToken(token)
    loadAll(period)
  }, [period, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#252940] dark:text-white">Analytics</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Métricas financeiras e de crescimento</p>
            </div>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg shadow-[#00c977]/30'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#00c977]/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'financial' && <FinancialTab data={financialData} loading={loadingFinancial} />}
          {tab === 'growth' && <GrowthTab data={growthData} loading={loadingGrowth} />}
        </motion.div>
      </div>
    </div>
  )
}
