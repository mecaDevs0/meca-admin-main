'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { VehicleDetailModal } from '@/components/vehicles/VehicleDetailModal'
import { VehicleEditModal } from '@/components/vehicles/VehicleEditModal'
import { VehicleDeleteModal } from '@/components/vehicles/VehicleDeleteModal'
import { motion } from 'framer-motion'
import { Car, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: string
  color: string
  fuel_type: string
  created_at: string
  customer_id: string
  customer_name: string
  customer_email: string
  booking_count: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [detailVehicle, setDetailVehicle] = useState<any>(null)
  const [editVehicle, setEditVehicle] = useState<any>(null)
  const [deleteVehicle, setDeleteVehicle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await apiClient.listVehicles(page, 25, search)
    setLoading(false)
    if (error) { showToast.error('Erro', error); return }
    const d = (data as any)?.data || data
    setVehicles(d?.vehicles || [])
    setTotalPages(d?.pages || 1)
    setTotal(d?.total || 0)
  }, [page, search])

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { router.push('/login'); return }
    apiClient.setToken(token)
    loadVehicles()
  }, [loadVehicles, router])

  const handleViewDetail = async (v: Vehicle) => {
    setLoadingDetail(true)
    const { data, error } = await apiClient.getVehicle(v.id)
    setLoadingDetail(false)
    if (error) { showToast.error('Erro', error); return }
    setDetailVehicle((data as any)?.data || data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#252940] dark:text-white">Veículos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total} veículos cadastrados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Pesquisar por placa, marca, modelo ou cliente..."
            className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#252940] dark:text-white focus:outline-none focus:border-[#00c977] transition-colors backdrop-blur-xl"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-12 flex justify-center"><Loading size={60} /></div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nenhum veículo encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {['Veículo', 'Placa', 'Cliente', 'Agendamentos', 'Cadastrado', 'Ações'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {vehicles.map((v) => (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                            <Car className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#252940] dark:text-white">{v.brand} {v.model}</p>
                            <p className="text-xs text-gray-400">{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-[#00c977]/10 text-[#00c977] text-xs font-mono font-bold px-2.5 py-1 rounded-lg">{v.plate}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#252940] dark:text-white">{v.customer_name}</p>
                        <p className="text-xs text-gray-400">{v.customer_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-[#252940] dark:text-white">{v.booking_count}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(v.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(v)}
                            disabled={loadingDetail}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditVehicle(v)}
                            className="p-2 rounded-xl bg-[#00c977]/10 text-[#00c977] hover:bg-[#00c977]/20 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteVehicle(v)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 hover:bg-[#00c977]/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 hover:bg-[#00c977]/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {detailVehicle && <VehicleDetailModal vehicle={detailVehicle} onClose={() => setDetailVehicle(null)} />}
      {editVehicle && <VehicleEditModal vehicle={editVehicle} onClose={() => setEditVehicle(null)} onSaved={loadVehicles} />}
      {deleteVehicle && <VehicleDeleteModal vehicle={deleteVehicle} onClose={() => setDeleteVehicle(null)} onDeleted={loadVehicles} />}
    </div>
  )
}
