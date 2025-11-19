'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { FileText, TrendingUp, Building2, Calendar, DollarSign, Download, Percent } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function ReportsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadMetrics()
  }, [router])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data: response, error } = await apiClient.getDashboardMetrics()

      if (error) {
        showToast.error('Erro ao carregar métricas', error || 'Não foi possível carregar os dados')
        setMetrics(null)
        setLoading(false)
        return
      }

      const normalized =
        response && typeof response === 'object' && 'data' in response
          ? (response as { data?: unknown }).data
          : response

      setMetrics(normalized || {})
    } catch (error) {
      console.error('Erro na requisição:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setMetrics(null)
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—'
    return `${(value * 100).toFixed(2)}%`
  }

  const revenueThisMonth = Number(metrics?.revenue_this_month || 0)
  const totalRevenueLastMonth = Number(metrics?.total_revenue_last_month || 0)
  const mecaCommissionLastMonth = Number(metrics?.meca_commission_last_month || 0)
  const totalBookingsLastMonth = Number(metrics?.total_bookings_last_month || 0)

  const customerRegistrations: Array<{ name: string; value: number }> =
    Array.isArray(metrics?.customer_registrations) ? metrics.customer_registrations : []
  const workshopRegistrations: Array<{ name: string; value: number }> =
    Array.isArray(metrics?.workshop_registrations) ? metrics.workshop_registrations : []

  const oficinasByStatus = metrics?.oficinas_by_status || {}

  const registrationsSeries = useMemo(() => {
    const combined: Record<string, { month: string; clientes: number; oficinas: number }> = {}
    const order: string[] = []

    customerRegistrations.forEach(({ name, value }) => {
      if (!combined[name]) {
        combined[name] = { month: name, clientes: 0, oficinas: 0 }
        order.push(name)
      }
      combined[name].clientes = value ?? 0
    })

    workshopRegistrations.forEach(({ name, value }) => {
      if (!combined[name]) {
        combined[name] = { month: name, clientes: 0, oficinas: 0 }
        order.push(name)
      }
      combined[name].oficinas = value ?? 0
    })

    return order.map((key) => combined[key])
  }, [customerRegistrations, workshopRegistrations])

  const oficinasStatusList = useMemo(
    () =>
      Object.entries(oficinasByStatus || {}).map(([status, total]) => ({
        status,
        total: Number(total) || 0,
      })),
    [oficinasByStatus],
  )

  const totalRegistrations = useMemo(
    () =>
      registrationsSeries.reduce(
        (acc, item) => ({ clientes: acc.clientes + item.clientes, oficinas: acc.oficinas + item.oficinas }),
        { clientes: 0, oficinas: 0 },
      ),
    [registrationsSeries],
  )

  const downloadCSV = (filename: string, rows: Array<Array<string | number>>) => {
    if (rows.length === 0) {
      showToast.warning('Sem dados', 'Não há dados disponíveis para exportar.')
      return
    }

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const normalized = typeof cell === 'number' ? cell.toString() : cell
            return `"${normalized.replace(/"/g, '""')}"`
          })
          .join(';'),
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast.success('Relatório gerado', `${filename} exportado com sucesso.`)
  }

  const handleExport = (type: 'finance' | 'registrations' | 'status') => {
    switch (type) {
      case 'finance':
        downloadCSV('meca-relatorio-financeiro.csv', [
          ['Indicador', 'Valor'],
          ['Receita (mês atual)', formatCurrency(revenueThisMonth)],
          ['Receita (último mês)', formatCurrency(totalRevenueLastMonth)],
          ['Comissão MECA (último mês)', formatCurrency(mecaCommissionLastMonth)],
          ['Taxa MECA vigente', formatPercent(metrics?.meca_fee_percentage ?? null)],
          ['Agendamentos (último mês)', totalBookingsLastMonth],
        ])
        break
      case 'registrations':
        downloadCSV('meca-cadastros.csv', [
          ['Mês', 'Novos clientes', 'Novas oficinas'],
          ...registrationsSeries.map((item) => [item.month, item.clientes, item.oficinas]),
          ['TOTAL', totalRegistrations.clientes, totalRegistrations.oficinas],
        ])
        break
      case 'status':
        downloadCSV('meca-oficinas-status.csv', [
          ['Status', 'Quantidade'],
          ...oficinasStatusList.map((item) => [item.status, item.total]),
        ])
        break
      default:
        break
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (loading) {
    return <Loading message="Carregando relatórios..." size={200} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Relatórios</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Consolidação financeira e operacional do marketplace MECA.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#00c977]" />
                Clientes
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
                Oficinas
              </div>
            </div>
          </div>
        </motion.div>

        {/* Highlights */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Receita (este mês)"
            value={formatCurrency(revenueThisMonth)}
            icon={<DollarSign className="w-5 h-5 text-white" />}
            accent="from-[#00c977] to-[#00b369]"
          />
          <StatCard
            title="Comissão MECA (último mês)"
            value={formatCurrency(mecaCommissionLastMonth)}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            accent="from-[#252940] to-[#1B1D2E]"
          />
          <StatCard
            title="Agendamentos (último mês)"
            value={totalBookingsLastMonth.toString()}
            icon={<Calendar className="w-5 h-5 text-white" />}
            accent="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Taxa MECA vigente"
            value={formatPercent(metrics?.meca_fee_percentage ?? null)}
            icon={<Percent className="w-5 h-5 text-white" />}
            accent="from-purple-500 to-purple-600"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PanelCard
            title="Evolução de cadastros"
            description="Volume mensal de novos clientes e oficinas (últimos meses)."
          >
            {registrationsSeries.length === 0 ? (
              <EmptyState message="Ainda não há histórico de cadastros suficientes para montar o gráfico." />
            ) : (
              <div className="space-y-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationsSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00c977" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00c977" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOficinas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                      <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: 12,
                          border: '1px solid #1e293b',
                          color: '#f8fafc',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" name="Clientes" dataKey="clientes" stroke="#00c977" fill="url(#colorClientes)" strokeWidth={2} />
                      <Area type="monotone" name="Oficinas" dataKey="oficinas" stroke="#2563eb" fill="url(#colorOficinas)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                    <span>Total de clientes</span>
                    <strong className="text-[#00c977] dark:text-[#4ade80]">{totalRegistrations.clientes}</strong>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                    <span>Total de oficinas</span>
                    <strong className="text-[#2563eb] dark:text-[#60a5fa]">{totalRegistrations.oficinas}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleExport('registrations')}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#252940] to-[#1B1D2E] text-white hover:from-[#1B1D2E] hover:to-[#252940] transition-all duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV de cadastros
                </button>
              </div>
            )}
          </PanelCard>

          <PanelCard
            title="Resumo de cadastros recentes"
            description="Indicadores para acompanhar crescimento da base nas últimas janelas." 
          >
            <div className="grid grid-cols-1 gap-3">
              <QuickReportCard
                title="Clientes este mês"
                value={customerRegistrations.length > 0 ? customerRegistrations[customerRegistrations.length - 1].value : 0}
                description="Novos clientes no mês corrente."
              />
              <QuickReportCard
                title="Oficinas este mês"
                value={workshopRegistrations.length > 0 ? workshopRegistrations[workshopRegistrations.length - 1].value : 0}
                description="Novas oficinas com cadastro completo."
              />
              <QuickReportCard
                title="Clientes nesta semana"
                value={metrics?.customers_this_week || 0}
                description="Usuários finalizando cadastro nos últimos 7 dias."
              />
              <QuickReportCard
                title="Oficinas aprovadas nesta semana"
                value={metrics?.workshops_this_week || 0}
                description="Oficinas validadas e habilitadas para operar."
              />
            </div>
          </PanelCard>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickReportCard
            title="Clientes cadastrados"
            value={metrics?.total_customers || 0}
            description="Clientes com conta ativa na plataforma."
          />
          <QuickReportCard
            title="Oficinas cadastradas"
            value={metrics?.total_oficinas || 0}
            description="Oficinas com cadastro concluído."
          />
          <QuickReportCard
            title="Clientes ativos"
            value={metrics?.active_customers || 0}
            description="Clientes que interagiram nos últimos 30 dias."
          />
          <QuickReportCard
            title="Oficinas ativas"
            value={metrics?.active_workshops || 0}
            description="Oficinas operando com PagBank sincronizado."
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string
  value: string
  icon: ReactNode
  accent: string
}) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 md:p-7 border border-white/40 dark:border-gray-700/40 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${accent} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-[#252940] dark:text-white">{value}</p>
    </div>
  )
}

function PanelCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/40 dark:border-gray-700/40 shadow-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#252940] dark:text-white">{title}</h2>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function QuickReportCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <div className="bg-white/85 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/40 dark:border-gray-700/40 shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-2xl font-bold text-[#252940] dark:text-white mb-2">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-500 dark:text-gray-400">
      {message}
    </div>
  )
}
