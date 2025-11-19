'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Percent, Phone, Save, X, Check, Undo2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Workshop {
  id: string
  name: string
  email: string
  phone?: string
  cnpj?: string
  address?: string
  city?: string
  state?: string
  cep?: string
  status?: string
  description?: string
  logo_url?: string
  facade_url?: string
  rating?: number
  total_reviews?: number
  meca_fee_percentage?: number | null
}

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)
  const workshopId = rawId && rawId !== 'undefined' ? rawId : ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState<Partial<Workshop>>({})
  const [mecaFeeOverride, setMecaFeeOverride] = useState<string>('')
  const [globalMecaFee, setGlobalMecaFee] = useState<number | null>(null)
  const [workshopMecaFee, setWorkshopMecaFee] = useState<number | null>(null)
  const [effectiveMecaFee, setEffectiveMecaFee] = useState<number | null>(null)
  const [loadingFee, setLoadingFee] = useState(false)

  const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined) {
      return 'Usando taxa global'
    }
    return `${(value * 100).toFixed(2)}%`
  }

  useEffect(() => {
    if (!workshopId) {
      setLoading(false)
      showToast.error('Oficina inválida', 'Identificador da oficina não foi informado.')
      return
    }

    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshop()
  }, [workshopId, router])

  const fetchMecaFeeSettings = async () => {
    if (!workshopId) {
        return
      }

    setLoadingFee(true)
    try {
      const { data: response, error } = await apiClient.getMecaFeeSettings({ workshopId })

      if (error) {
        showToast.error('Erro ao carregar taxa MECA', error || 'Não foi possível obter as taxas.')
        return
      }

      const payload =
        response && typeof response === 'object' && 'data' in response
          ? (response as { data?: any }).data
          : response

      const globalFee =
        typeof payload?.global_fee === 'number' ? payload.global_fee : globalMecaFee ?? null
      const override =
        typeof payload?.requested_workshop?.override === 'number'
          ? payload.requested_workshop.override
          : null
      const effective =
        typeof payload?.requested_workshop?.effective === 'number'
          ? payload.requested_workshop.effective
          : override ?? globalFee ?? null

      setGlobalMecaFee(globalFee)
      setWorkshopMecaFee(override)
      setEffectiveMecaFee(effective)
      setMecaFeeOverride(
        override !== null && override !== undefined ? (override * 100).toFixed(2) : ''
      )
      setFormData((prev) => ({
      ...prev,
        meca_fee_percentage: override ?? null,
      }))
    } catch (error) {
      console.error('Erro ao carregar taxa MECA:', error)
      showToast.error('Erro ao carregar taxa MECA', 'Não foi possível obter as taxas.')
    } finally {
      setLoadingFee(false)
    }
  }

  const loadWorkshop = async () => {
    if (!workshopId) {
      setWorkshop(null)
      setFormData({})
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data: response, error } = await apiClient.getWorkshop(workshopId)

      if (error) {
        showToast.error('Erro ao carregar oficina', error || 'Não foi possível carregar os dados')
        router.push('/dashboard/workshops')
        return
      }

      if (!response || (typeof response === 'object' && 'success' in response && (response as any).success === false)) {
        showToast.error('Erro ao carregar oficina', 'Não foi possível localizar os dados dessa oficina.')
        setWorkshop(null)
        setFormData({})
        setLoading(false)
      return
    }

      const payload = response && typeof response === 'object' && 'data' in response
        ? (response as { data?: unknown }).data
        : response

      if (!payload || (typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload as Record<string, any>).length === 0)) {
        showToast.error('Oficina não encontrada', 'Ela pode ter sido removida recentemente.')
        setWorkshop(null)
        setFormData({})
        setLoading(false)
        return
      }

      const workshopData = (payload && typeof payload === 'object' && !Array.isArray(payload))
        ? payload
        : (Array.isArray(payload) ? payload[0] : (response && typeof response === 'object' ? response : {}))
      
      // Garantir que description existe (mesmo que null)
      const normalizedData = {
        ...workshopData,
        description: workshopData.description ?? null,
        meca_fee_percentage:
          workshopData.meca_fee_percentage !== undefined && workshopData.meca_fee_percentage !== null
            ? Number(workshopData.meca_fee_percentage)
            : null,
      }
      
      setWorkshop(normalizedData as Workshop)
      setFormData(normalizedData as Workshop)
      await fetchMecaFeeSettings()
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao carregar a oficina')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let overrideDecimal: number | null = null
      const trimmedOverride = mecaFeeOverride.trim()

      if (trimmedOverride !== '') {
        const parsed = Number(trimmedOverride.replace(',', '.'))
        if (Number.isNaN(parsed)) {
          showToast.error('Valor inválido', 'Informe um número entre 0 e 100 para a taxa MECA.')
      setSaving(false)
        return
      }
        if (parsed < 0 || parsed > 100) {
          showToast.error('Valor inválido', 'A taxa MECA deve estar entre 0% e 100%.')
      setSaving(false)
        return
      }
        overrideDecimal = parsed / 100
      }

      const payload = {
        ...formData,
        meca_fee_percentage: overrideDecimal,
      }

      const { data: response, error } = await apiClient.updateWorkshop(workshopId, payload)

      if (error) {
        showToast.error('Erro ao salvar', error || 'Não foi possível salvar as alterações')
        return
      }

      showToast.success('Oficina atualizada!', 'As alterações foram salvas com sucesso')
      await fetchMecaFeeSettings()
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao salvar')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Workshop, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMecaFeeInputChange = (value: string) => {
    setMecaFeeOverride(value)
    const trimmed = value.trim()

    if (trimmed === '') {
      setWorkshopMecaFee(null)
      setEffectiveMecaFee(globalMecaFee)
      setFormData((prev) => ({
        ...prev,
        meca_fee_percentage: null,
      }))
        return
      }

    const parsed = Number(trimmed.replace(',', '.'))
    if (Number.isNaN(parsed)) {
        return
      }

    const decimal = parsed / 100
    setWorkshopMecaFee(decimal)
    setEffectiveMecaFee(decimal)
    setFormData((prev) => ({
      ...prev,
      meca_fee_percentage: decimal,
    }))
  }

  const handleResetMecaFee = () => {
    setMecaFeeOverride('')
    setWorkshopMecaFee(null)
    setEffectiveMecaFee(globalMecaFee)
    setFormData((prev) => ({
      ...prev,
      meca_fee_percentage: null,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[#00c977] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!workshop) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
        <div className="max-w-lg w-full bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-xl p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white">Não foi possível carregar a oficina</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verifique se a oficina ainda existe na base ou tente novamente em instantes. Caso o problema persista, recarregue a página ou volte para a lista de oficinas.
          </p>
          <button
            onClick={() => router.push('/dashboard/workshops')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00c977] to-[#00b369] text-white font-semibold hover:from-[#00b369] hover:to-[#00a05a] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de oficinas
          </button>
            </div>
    </div>
  )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/workshops')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#252940] dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Editar Oficina</h1>
              <p className="text-gray-600 dark:text-gray-400">{workshop.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj || ''}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Endereço</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CEP</label>
                  <input
                    type="text"
                    value={formData.cep || ''}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Informações Adicionais</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description ?? ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all resize-none dark:bg-gray-900/50 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Taxa MECA
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Taxa global atual</p>
                  <p className="text-2xl font-bold text-[#00c977] dark:text-[#4ade80]">
                    {formatPercent(globalMecaFee)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Esta taxa é aplicada automaticamente a todas as oficinas que não possuem um valor personalizado.
                  </p>
            </div>

                <div className="bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taxa personalizada para esta oficina
                    </label>
                    <div className="flex gap-3 items-center">
                      <div className="relative flex-1">
                    <input
                      type="text"
                          value={mecaFeeOverride}
                          onChange={(e) => handleMecaFeeInputChange(e.target.value)}
                          placeholder="Ex: 7.0"
                          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                        />
                        <Percent className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                      <button
                        type="button"
                        onClick={handleResetMecaFee}
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                        disabled={mecaFeeOverride.trim() === '' || loadingFee}
                      >
                        <Undo2 className="w-4 h-4" />
                        Remover override
                      </button>
                </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Deixe em branco para utilizar a taxa global. Informe o valor em porcentagem (ex: 7 para 7%).
                    </p>
            </div>

                  <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-semibold">Taxa aplicada:</span>{' '}
                      <span className="text-[#00c977] dark:text-[#4ade80]">
                        {formatPercent(effectiveMecaFee)}
                      </span>
                    </p>
                    {workshopMecaFee !== null && (
                      <p className="mt-1 text-xs text-[#00c977]">
                        Este valor está usando a taxa personalizada definida para esta oficina.
                      </p>
                    )}
              </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/workshops')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-semibold rounded-xl shadow-lg shadow-[#00c977]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

