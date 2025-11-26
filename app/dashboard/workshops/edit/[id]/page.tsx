'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Percent, Phone, Save, X, Check, Undo2, Upload, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useRef, ChangeEvent } from 'react'

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
  logo_url?: string | null
  facade_url?: string | null
  rating?: number
  total_reviews?: number
  meca_fee_percentage?: number | null
}

const ALLOWED_LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024

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
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoRemoving, setLogoRemoving] = useState(false)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [isFetchingCep, setIsFetchingCep] = useState(false)

  const isAuthExpiredError = (message?: string) => {
    if (!message) {
      return false
    }
    const normalized = message.toLowerCase()
    return normalized.includes('jwt expired') || normalized.includes('token expirado') || normalized.includes('token expired')
  }

  const handleAuthExpired = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('meca_admin_token')
    }
    showToast.error('Sessão expirada', 'Faça login novamente para continuar.')
    router.push('/login')
  }

  const handleApiAuthError = (message?: string, status?: number) => {
    if (status === 401 || isAuthExpiredError(message)) {
      handleAuthExpired()
      return true
    }
    return false
  }

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

  useEffect(() => {
    return () => {
      if (logoPreviewUrl && typeof window !== 'undefined') {
        URL.revokeObjectURL(logoPreviewUrl)
      }
    }
  }, [logoPreviewUrl])

  const fetchMecaFeeSettings = async () => {
    if (!workshopId) {
        return
      }

    setLoadingFee(true)
    try {
      const { data: response, error, status } = await apiClient.getMecaFeeSettings({ workshopId })

      if (handleApiAuthError(error, status)) {
        return
      }

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
      const { data: response, error, status } = await apiClient.getWorkshop(workshopId)

      if (error) {
        if (handleApiAuthError(error, status)) {
          return
        }
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

      const { data: response, error, status } = await apiClient.updateWorkshop(workshopId, payload)

      if (error) {
        if (handleApiAuthError(error, status)) {
          return
        }
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

  const handleCepBlur = async () => {
    const cep = formData.cep?.trim().replace(/\D/g, '') || ''
    
    // Validar CEP (deve ter 8 dígitos)
    if (cep.length !== 8) {
      return
    }

    // Se já tem city e state preenchidos, não buscar novamente
    if (formData.city && formData.state) {
      return
    }

    setIsFetchingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP')
      }

      const data = await response.json()

      if (data.erro) {
        showToast.error('CEP não encontrado', 'Verifique se o CEP está correto')
        return
      }

      // Preencher campos automaticamente
      const updates: Partial<Workshop> = {}
      
      if (data.logradouro) {
        // Se não tem address ou está vazio, preencher com logradouro
        if (!formData.address || formData.address.trim() === '') {
          updates.address = data.logradouro
        }
      }
      
      if (data.localidade && !formData.city) {
        updates.city = data.localidade
      }
      
      if (data.uf && !formData.state) {
        updates.state = data.uf
      }

      // Atualizar formData com os dados encontrados
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updates,
        }))
        showToast.success('Endereço encontrado!', 'Os dados foram preenchidos automaticamente')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      showToast.error('Erro ao buscar CEP', 'Não foi possível buscar o endereço. Tente novamente.')
    } finally {
      setIsFetchingCep(false)
    }
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

  const setLogoPreviewFromFile = (file: File | null) => {
    if (typeof window === 'undefined') {
      return
    }

    if (!file) {
      setLogoPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setLogoPreviewUrl(objectUrl)
  }

  const readFileAsDataUrl = (file: File) => {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Upload disponível apenas no navegador.'))
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Não foi possível processar a imagem selecionada.'))
        }
      }
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'))
      reader.readAsDataURL(file)
    })
  }

  const uploadLogoFile = async (file: File) => {
    if (!workshopId) {
      showToast.error('Oficina inválida', 'Não foi possível identificar a oficina.')
      return
    }

    if (!ALLOWED_LOGO_MIME_TYPES.includes((file.type || '').toLowerCase())) {
      showToast.error('Formato inválido', 'Envie uma imagem JPG, PNG ou WebP.')
      return
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      showToast.error('Imagem muito grande', 'O tamanho máximo permitido é 5MB.')
      return
    }

    setLogoPreviewFromFile(file)
    setLogoUploading(true)

    try {
      const base64DataUrl = await readFileAsDataUrl(file)
      const { data: response, error, status } = await apiClient.uploadWorkshopLogo(workshopId, base64DataUrl)
      const serverResponse =
        response && typeof response === 'object'
          ? (response as { success?: boolean; error?: string; data?: any })
          : undefined
      const apiErrorMessage = serverResponse?.error || error

      if (handleApiAuthError(apiErrorMessage, status)) {
        return
      }

      if (error || serverResponse?.success === false) {
        throw new Error(apiErrorMessage || 'Não foi possível atualizar a logo desta oficina.')
      }

      const payload =
        response && typeof response === 'object' && 'data' in response
          ? (response as { data?: Record<string, any> }).data
          : response

      const updatedLogoUrl =
        (payload && typeof payload === 'object' && 'logo_url' in payload ? (payload as any).logo_url : null) ||
        null

      if (updatedLogoUrl) {
        setWorkshop((prev) => (prev ? { ...prev, logo_url: updatedLogoUrl } : prev))
        setFormData((prev) => ({
          ...prev,
          logo_url: updatedLogoUrl,
        }))
      } else {
        await loadWorkshop()
      }

      showToast.success('Logo atualizada', 'A nova logo foi salva com sucesso.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar logo.'
      if (handleApiAuthError(message)) {
        return
      }
      showToast.error('Erro ao enviar logo', message)
    } finally {
      setLogoUploading(false)
      setLogoPreviewFromFile(null)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  const handleLogoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    await uploadLogoFile(file)
    event.target.value = ''
  }

  const handleLogoRemove = async () => {
    if (!workshopId) {
      showToast.error('Oficina inválida', 'Não foi possível identificar a oficina.')
      return
    }

    if (!workshop?.logo_url) {
      showToast.info('Sem logo para remover', 'Esta oficina não possui logo cadastrada.')
      return
    }

    const confirmRemoval =
      typeof window === 'undefined'
        ? true
        : window.confirm('Tem certeza que deseja remover a logo desta oficina?')

    if (!confirmRemoval) {
      return
    }

    setLogoRemoving(true)
    try {
      const { data: response, error, status } = await apiClient.removeWorkshopLogo(workshopId)
      const serverResponse =
        response && typeof response === 'object'
          ? (response as { success?: boolean; error?: string; data?: any })
          : undefined
      const apiErrorMessage = serverResponse?.error || error

      if (handleApiAuthError(apiErrorMessage, status)) {
        return
      }

      if (error || serverResponse?.success === false) {
        throw new Error(apiErrorMessage || 'Não foi possível remover a logo desta oficina.')
      }

      setWorkshop((prev) => (prev ? { ...prev, logo_url: null } : prev))
      setFormData((prev) => ({
        ...prev,
        logo_url: null,
      }))

      showToast.success('Logo removida', 'A logo foi removida com sucesso.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover logo.'
      if (handleApiAuthError(message)) {
        return
      }
      showToast.error('Erro ao remover logo', message)
    } finally {
      setLogoRemoving(false)
      setLogoPreviewFromFile(null)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
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

  const currentLogoPreview =
    logoPreviewUrl ||
    (workshop.logo_url && workshop.logo_url.startsWith('http') ? workshop.logo_url : null)

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
            {workshop.logo_url && workshop.logo_url.startsWith('http') ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                <img 
                  src={workshop.logo_url} 
                  alt={workshop.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-xl flex items-center justify-center shadow-lg hidden">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#252940] to-[#1B1D2E] rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CEP
                    {isFetchingCep && (
                      <span className="ml-2 text-xs text-[#00c977]">Buscando...</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => {
                        // Formatar CEP enquanto digita (00000-000)
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length > 5) {
                          value = value.slice(0, 5) + '-' + value.slice(5, 8)
                        }
                        handleChange('cep', value)
                      }}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                      disabled={isFetchingCep}
                    />
                    {isFetchingCep && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-[#00c977] animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Digite o CEP e saia do campo para buscar o endereço automaticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Logo Management */}
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-2">Logo da Oficina</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Visualize, envie ou remova a logo da oficina. O arquivo será aplicado imediatamente no app da oficina e no app cliente.
              </p>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 flex items-center justify-center overflow-hidden shadow-inner">
                  {logoUploading ? (
                    <Loader2 className="w-10 h-10 text-[#00c977] animate-spin" />
                  ) : currentLogoPreview ? (
                    <img
                      src={currentLogoPreview}
                      alt={`Logo ${workshop.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-1 text-center px-2">
                      <Building2 className="w-7 h-7" />
                      <span className="text-xs leading-tight">Sem logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    ref={logoInputRef}
                    id="logo-upload"
                    type="file"
                    accept={ALLOWED_LOGO_MIME_TYPES.join(',')}
                    className="hidden"
                    onChange={handleLogoFileChange}
                    disabled={logoUploading || logoRemoving}
                  />
                  <div className="flex flex-wrap gap-3">
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#00c977]/60 text-[#00c977] font-semibold cursor-pointer transition hover:bg-[#00c977]/5 ${
                        logoUploading || logoRemoving ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      {logoUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Selecionar logo
                        </>
                      )}
                    </label>
                    {workshop.logo_url && (
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        disabled={logoRemoving || logoUploading}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {logoRemoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Remover logo
                      </button>
                    )}
                    {workshop.logo_url && (
                      <a
                        href={workshop.logo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver imagem completa
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Formatos suportados: JPG, PNG ou WebP. Tamanho máximo: 5MB. Recomende ao menos 500x500px.
                  </p>
                  {logoPreviewUrl && (
                    <p className="text-xs font-medium text-[#00c977]">
                      Pré-visualização carregada. Finalizando upload...
                    </p>
                  )}
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

