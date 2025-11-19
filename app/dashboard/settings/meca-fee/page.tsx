'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Percent, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface WorkshopOverride {
  id: string
  name: string
  email: string
  fee: number | null
}

interface WorkshopOption {
  id: string
  name: string
  email: string
}

export default function MecaFeeSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savingGlobal, setSavingGlobal] = useState(false)
  const [savingOverride, setSavingOverride] = useState(false)
  const [removingOverride, setRemovingOverride] = useState<string | null>(null)

  const [globalFee, setGlobalFee] = useState<number | null>(null)
  const [globalFeeInput, setGlobalFeeInput] = useState('')

  const [overrides, setOverrides] = useState<WorkshopOverride[]>([])
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([])

  const [selectedWorkshopId, setSelectedWorkshopId] = useState('')
  const [overrideInput, setOverrideInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [feeRes, workshopsRes] = await Promise.all([
        apiClient.getMecaFeeSettings(),
        apiClient.getWorkshops(),
      ])

      if (feeRes.error) {
        showToast.error('Erro', feeRes.error || 'Não foi possível obter as taxas')
      } else {
        const payload =
          feeRes.data && typeof feeRes.data === 'object' && 'data' in feeRes.data
            ? (feeRes.data as { data: any }).data
            : feeRes.data

        const currentGlobal =
          typeof payload?.global_fee === 'number' ? payload.global_fee : globalFee ?? null
        const overridesList: WorkshopOverride[] = Array.isArray(payload?.overrides)
          ? payload.overrides.map((item: any) => ({
              id: item.id,
              name: item.name,
              email: item.email,
              fee:
                typeof item.fee === 'number'
                  ? item.fee
                  : item.fee !== null && item.fee !== undefined
                    ? Number(item.fee)
                    : null,
            }))
          : []

        setGlobalFee(currentGlobal)
        setGlobalFeeInput(
          currentGlobal !== null && currentGlobal !== undefined ? (currentGlobal * 100).toFixed(2) : ''
        )
        setOverrides(overridesList)
      }

      if (workshopsRes.error) {
        showToast.error('Erro', workshopsRes.error || 'Não foi possível carregar as oficinas')
      } else {
        const payload =
          workshopsRes.data && typeof workshopsRes.data === 'object' && 'oficinas' in workshopsRes.data
            ? (workshopsRes.data as { oficinas: any[] }).oficinas
            : Array.isArray(workshopsRes.data)
              ? workshopsRes.data
              : []

        const options: WorkshopOption[] = Array.isArray(payload)
          ? payload.map((item: any) => ({
              id: item.id,
              name: item.name || 'Sem nome',
              email: item.email || '',
            }))
          : []

        setWorkshops(options)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da taxa MECA:', error)
      showToast.error('Erro', 'Não foi possível carregar as informações.')
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkshopOptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return workshops
    return workshops.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.email.toLowerCase().includes(term) ||
        w.id.toLowerCase().includes(term)
    )
  }, [workshops, search])

  const handleSaveGlobal = async () => {
    const trimmed = globalFeeInput.trim()
    if (trimmed === '') {
      showToast.error('Valor inválido', 'Informe uma taxa percentual (ex: 7).')
      return
    }

    const parsed = Number(trimmed.replace(',', '.'))
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      showToast.error('Valor inválido', 'A taxa global deve estar entre 0% e 100%.')
      return
    }

    setSavingGlobal(true)
    try {
      const { error } = await apiClient.updateMecaFeeSettings({
        global_fee: parsed / 100,
      })

      if (error) {
        showToast.error('Erro ao atualizar', error || 'Não foi possível atualizar a taxa global.')
        return
      }

      showToast.success('Sucesso', 'Taxa global atualizada com sucesso.')
      await loadData()
    } catch (error) {
      console.error('Erro ao atualizar taxa global:', error)
      showToast.error('Erro', 'Ocorreu um erro ao atualizar a taxa global.')
    } finally {
      setSavingGlobal(false)
    }
  }

  const handleSaveOverride = async () => {
    if (!selectedWorkshopId) {
      showToast.error('Selecione a oficina', 'Escolha uma oficina para aplicar a taxa personalizada.')
      return
    }

    const trimmed = overrideInput.trim()
    if (trimmed === '') {
      showToast.error('Valor inválido', 'Informe a taxa personalizada (ex: 6).')
      return
    }

    const parsed = Number(trimmed.replace(',', '.'))
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      showToast.error('Valor inválido', 'A taxa personalizada deve estar entre 0% e 100%.')
      return
    }

    setSavingOverride(true)
    try {
      const { error } = await apiClient.updateMecaFeeSettings({
        workshop_id: selectedWorkshopId,
        workshop_fee: parsed / 100,
      })

      if (error) {
        showToast.error('Erro ao aplicar', error || 'Não foi possível atualizar a taxa da oficina.')
        return
      }

      showToast.success('Sucesso', 'Taxa personalizada aplicada com sucesso.')
      setSelectedWorkshopId('')
      setOverrideInput('')
      await loadData()
    } catch (error) {
      console.error('Erro ao atualizar taxa da oficina:', error)
      showToast.error('Erro', 'Ocorreu um erro ao atualizar a taxa da oficina.')
    } finally {
      setSavingOverride(false)
    }
  }

  const handleRemoveOverride = async (workshopId: string) => {
    setRemovingOverride(workshopId)
    try {
      const { error } = await apiClient.updateMecaFeeSettings({
        workshop_id: workshopId,
        workshop_fee: null,
      })

      if (error) {
        showToast.error('Erro ao remover', error || 'Não foi possível remover o override.')
        return
      }

      showToast.success('Sucesso', 'Override removido com sucesso.')
      await loadData()
    } catch (error) {
      console.error('Erro ao remover override:', error)
      showToast.error('Erro', 'Ocorreu um erro ao remover a taxa personalizada.')
    } finally {
      setRemovingOverride(null)
    }
  }

  const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined) {
      return '—'
    }
    return `${(value * 100).toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-[#00c977] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Taxa MECA</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure a taxa da plataforma aplicada às oficinas e personalize onde necessário.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">
                Taxa global da plataforma
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Este valor será usado como padrão para todas as oficinas que não possuem um override específico.
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  value={globalFeeInput}
                  onChange={(e) => setGlobalFeeInput(e.target.value)}
                  placeholder="Ex: 7"
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                />
                <Percent className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveGlobal}
                disabled={savingGlobal}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00c977] to-[#00b369] text-white font-semibold shadow-lg disabled:opacity-60"
              >
                {savingGlobal ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar taxa global
                  </>
                )}
              </motion.button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium">
                Taxa global atual:{' '}
                <span className="text-[#00c977] dark:text-[#4ade80]">{formatPercent(globalFee)}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Mudanças na taxa global entram em vigor imediatamente para todas as oficinas que não possuam uma taxa personalizada.
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#252940] dark:text-white mb-2">
                Aplicar taxa personalizada
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Escolha uma oficina e defina uma taxa específica apenas para ela.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar oficina por nome, email ou ID"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
            />

            <select
              value={selectedWorkshopId}
              onChange={(e) => setSelectedWorkshopId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
            >
              <option value="">Selecione uma oficina</option>
              {filteredWorkshopOptions.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name} — {workshop.email || workshop.id}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                value={overrideInput}
                onChange={(e) => setOverrideInput(e.target.value)}
                placeholder="Taxa personalizada (%)"
                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
              <Percent className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveOverride}
              disabled={savingOverride}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#252940] to-[#1B1D2E] text-white font-semibold shadow-lg disabled:opacity-60"
            >
              {savingOverride ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Aplicar override
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#252940] dark:text-white">
                Oficinas com taxa personalizada
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lista de oficinas que possuem uma taxa MECA diferente da taxa global.
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total: {overrides.length}
            </span>
          </div>

          {overrides.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              Nenhuma oficina com taxa personalizada no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-100/80 dark:bg-gray-900/60 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 rounded-l-2xl">Oficina</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Taxa personalizada</th>
                    <th className="px-4 py-3 text-right rounded-r-2xl">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
                  {overrides.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3">{item.email || '—'}</td>
                      <td className="px-4 py-3 text-[#00c977] dark:text-[#4ade80]">
                        {formatPercent(item.fee)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveOverride(item.id)}
                          disabled={removingOverride === item.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {removingOverride === item.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Remover
                            </>
                          )}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}


