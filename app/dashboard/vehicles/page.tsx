'use client'

import { apiClient } from '@/lib/api'
import { TableSkeleton } from '@/components/ui/Skeletons'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { showToast } from '@/lib/toast'
import { exportCsv, csvFilename } from '@/lib/csv'
import { motion } from 'framer-motion'
import { Car, Search, X, Download, Trash2, Edit, AlertTriangle } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: string | number
  color?: string
  customer_name?: string
  customer_id?: string
  total_bookings?: number
  created_at: string
}

const PAGE_SIZE = 20

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehiclesPageInner />
    </Suspense>
  )
}

function VehiclesPageInner() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { window.location.replace('/login/'); return }
    apiClient.setToken(token)
  }, [])

  useEffect(() => {
    loadVehicles()
  }, [page, search])

  const loadVehicles = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (search.trim()) params.set('search', search.trim())
    const { data, error } = await apiClient.request<any>(`/admin/vehicles?${params}`)
    if (data) {
      const raw = data.data ?? data
      const list = raw.vehicles ?? raw.data ?? (Array.isArray(raw) ? raw : [])
      setVehicles(list)
      setTotal(raw.total ?? list.length)
    } else {
      showToast.error('Erro ao carregar veículos', error || '')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await apiClient.request(`/admin/vehicles/${deleteTarget.id}`, { method: 'DELETE' })
    if (error) {
      showToast.error('Erro ao excluir', error)
    } else {
      showToast.success('Veículo excluído', `${deleteTarget.plate} removido`)
      loadVehicles()
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const handleExport = () => {
    if (vehicles.length === 0) return
    exportCsv(
      csvFilename('veiculos'),
      [
        { header: 'Placa', accessor: (v: Vehicle) => v.plate },
        { header: 'Marca', accessor: (v: Vehicle) => v.brand },
        { header: 'Modelo', accessor: (v: Vehicle) => v.model },
        { header: 'Ano', accessor: (v: Vehicle) => v.year },
        { header: 'Cor', accessor: (v: Vehicle) => v.color || '' },
        { header: 'Dono', accessor: (v: Vehicle) => v.customer_name || '' },
        { header: 'Bookings', accessor: (v: Vehicle) => String(v.total_bookings ?? 0) },
      ],
      vehicles,
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const brandCounts: Record<string, number> = {}
  vehicles.forEach((v) => {
    const brand = v.brand || 'Outros'
    brandCounts[brand] = (brandCounts[brand] || 0) + 1
  })
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]

  const itemVariants = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="max-w-[1920px] mx-auto space-y-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white mb-1">Veículos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Frota cadastrada no marketplace MECA</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-[#00c977] transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total de Veículos" value={total} icon={Car} gradient="from-[#252940] to-[#1B1D2E]" sub="cadastrados" />
          <StatCard label="Marca Mais Comum" value={topBrand ? topBrand[0] : '—'} icon={Car} gradient="from-blue-500 to-blue-600" sub={topBrand ? `${topBrand[1]} veículos` : ''} />
          <StatCard label="Veículos com Booking" value={vehicles.filter((v) => (v.total_bookings ?? 0) > 0).length} icon={Car} gradient="from-[#00c977] to-[#00b369]" sub="com agendamento" />
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por placa, marca ou modelo..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-[#252940] dark:text-white placeholder-gray-400 outline-none focus:border-[#00c977] transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </motion.div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title={search ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
            description={search ? `Sem resultados para "${search}"` : 'Veículos aparecerão aqui quando forem cadastrados nos apps.'}
            action={search ? { label: 'Limpar busca', onClick: () => { setSearch(''); setPage(1) } } : undefined}
          />
        ) : (
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Placa</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Veículo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Ano</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Dono</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Bookings</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, i) => (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-700 text-[#252940] dark:text-white font-mono">
                          {v.plate}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#252940] dark:text-white">
                        {v.brand} {v.model}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{v.year}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{v.customer_name || '—'}</td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className={`text-xs font-semibold ${(v.total_bookings ?? 0) > 0 ? 'text-[#00c977]' : 'text-gray-400'}`}>
                          {v.total_bookings ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeleteTarget(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Excluir veículo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/50">
                <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {deleteTarget && (
        <ConfirmDialog
          open
          title="Excluir Veículo"
          description={`Tem certeza que deseja excluir o veículo ${deleteTarget.plate} (${deleteTarget.brand} ${deleteTarget.model})?`}
          confirmLabel="Excluir"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
