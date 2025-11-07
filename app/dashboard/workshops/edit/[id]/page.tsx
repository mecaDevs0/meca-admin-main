'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Save, X, Check, CheckCircle, XCircle } from 'lucide-react'
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
}

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const workshopId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState<Partial<Workshop>>({})

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshop()
  }, [workshopId, router])

  const loadWorkshop = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao carregar oficina', error || 'Não foi possível carregar os dados')
        router.push('/dashboard/workshops')
        return
      }

      const workshopData = data.data || data
      
      // Garantir que description existe (mesmo que null)
      const normalizedData = {
        ...workshopData,
        description: workshopData.description ?? null
      }
      
      setWorkshop(normalizedData as Workshop)
      setFormData(normalizedData as Workshop)
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
      const { data, error } = await apiClient.updateWorkshop(workshopId, formData)

      if (error || !data) {
        showToast.error('Erro ao salvar', error || 'Não foi possível salvar as alterações')
        return
      }

      showToast.success('Oficina atualizada!', 'As alterações foram salvas com sucesso')
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

  const handleApprove = async () => {
    setSaving(true)
    try {
      const { data, error } = await apiClient.approveWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao aprovar', error || 'Não foi possível aprovar a oficina')
        return
      }

      showToast.success('Oficina aprovada!', 'A oficina foi aprovada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao aprovar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Motivo da rejeição (opcional):')
    if (reason === null) return // Usuário cancelou

    setSaving(true)
    try {
      const { data, error } = await apiClient.rejectWorkshop(workshopId, reason || '')

      if (error || !data) {
        showToast.error('Erro ao rejeitar', error || 'Não foi possível rejeitar a oficina')
        return
      }

      showToast.success('Oficina rejeitada', 'A oficina foi rejeitada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao rejeitar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
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
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
        >
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

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Approve/Reject Actions (only if pending) */}
              {workshop.status === 'pendente' && (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Aprovar Oficina
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Rejeitar Oficina
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              
              {/* Save/Cancel Actions */}
              <div className="flex gap-4">
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
        </motion.div>
      </motion.div>
    </div>
  )
}


import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Save, X, Check, CheckCircle, XCircle } from 'lucide-react'
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
}

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const workshopId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState<Partial<Workshop>>({})

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshop()
  }, [workshopId, router])

  const loadWorkshop = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao carregar oficina', error || 'Não foi possível carregar os dados')
        router.push('/dashboard/workshops')
        return
      }

      const workshopData = data.data || data
      
      // Garantir que description existe (mesmo que null)
      const normalizedData = {
        ...workshopData,
        description: workshopData.description ?? null
      }
      
      setWorkshop(normalizedData as Workshop)
      setFormData(normalizedData as Workshop)
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
      const { data, error } = await apiClient.updateWorkshop(workshopId, formData)

      if (error || !data) {
        showToast.error('Erro ao salvar', error || 'Não foi possível salvar as alterações')
        return
      }

      showToast.success('Oficina atualizada!', 'As alterações foram salvas com sucesso')
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

  const handleApprove = async () => {
    setSaving(true)
    try {
      const { data, error } = await apiClient.approveWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao aprovar', error || 'Não foi possível aprovar a oficina')
        return
      }

      showToast.success('Oficina aprovada!', 'A oficina foi aprovada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao aprovar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Motivo da rejeição (opcional):')
    if (reason === null) return // Usuário cancelou

    setSaving(true)
    try {
      const { data, error } = await apiClient.rejectWorkshop(workshopId, reason || '')

      if (error || !data) {
        showToast.error('Erro ao rejeitar', error || 'Não foi possível rejeitar a oficina')
        return
      }

      showToast.success('Oficina rejeitada', 'A oficina foi rejeitada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao rejeitar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
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
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
        >
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

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Approve/Reject Actions (only if pending) */}
              {workshop.status === 'pendente' && (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Aprovar Oficina
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Rejeitar Oficina
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              
              {/* Save/Cancel Actions */}
              <div className="flex gap-4">
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
        </motion.div>
      </motion.div>
    </div>
  )
}


import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Save, X, Check, CheckCircle, XCircle } from 'lucide-react'
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
}

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const workshopId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState<Partial<Workshop>>({})

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshop()
  }, [workshopId, router])

  const loadWorkshop = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao carregar oficina', error || 'Não foi possível carregar os dados')
        router.push('/dashboard/workshops')
        return
      }

      const workshopData = data.data || data
      
      // Garantir que description existe (mesmo que null)
      const normalizedData = {
        ...workshopData,
        description: workshopData.description ?? null
      }
      
      setWorkshop(normalizedData as Workshop)
      setFormData(normalizedData as Workshop)
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
      const { data, error } = await apiClient.updateWorkshop(workshopId, formData)

      if (error || !data) {
        showToast.error('Erro ao salvar', error || 'Não foi possível salvar as alterações')
        return
      }

      showToast.success('Oficina atualizada!', 'As alterações foram salvas com sucesso')
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

  const handleApprove = async () => {
    setSaving(true)
    try {
      const { data, error } = await apiClient.approveWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao aprovar', error || 'Não foi possível aprovar a oficina')
        return
      }

      showToast.success('Oficina aprovada!', 'A oficina foi aprovada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao aprovar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Motivo da rejeição (opcional):')
    if (reason === null) return // Usuário cancelou

    setSaving(true)
    try {
      const { data, error } = await apiClient.rejectWorkshop(workshopId, reason || '')

      if (error || !data) {
        showToast.error('Erro ao rejeitar', error || 'Não foi possível rejeitar a oficina')
        return
      }

      showToast.success('Oficina rejeitada', 'A oficina foi rejeitada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao rejeitar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
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
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
        >
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

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Approve/Reject Actions (only if pending) */}
              {workshop.status === 'pendente' && (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Aprovar Oficina
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Rejeitar Oficina
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              
              {/* Save/Cancel Actions */}
              <div className="flex gap-4">
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
        </motion.div>
      </motion.div>
    </div>
  )
}


import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Save, X, Check, CheckCircle, XCircle } from 'lucide-react'
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
}

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const workshopId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState<Partial<Workshop>>({})

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshop()
  }, [workshopId, router])

  const loadWorkshop = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao carregar oficina', error || 'Não foi possível carregar os dados')
        router.push('/dashboard/workshops')
        return
      }

      const workshopData = data.data || data
      
      // Garantir que description existe (mesmo que null)
      const normalizedData = {
        ...workshopData,
        description: workshopData.description ?? null
      }
      
      setWorkshop(normalizedData as Workshop)
      setFormData(normalizedData as Workshop)
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
      const { data, error } = await apiClient.updateWorkshop(workshopId, formData)

      if (error || !data) {
        showToast.error('Erro ao salvar', error || 'Não foi possível salvar as alterações')
        return
      }

      showToast.success('Oficina atualizada!', 'As alterações foram salvas com sucesso')
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

  const handleApprove = async () => {
    setSaving(true)
    try {
      const { data, error } = await apiClient.approveWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao aprovar', error || 'Não foi possível aprovar a oficina')
        return
      }

      showToast.success('Oficina aprovada!', 'A oficina foi aprovada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao aprovar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Motivo da rejeição (opcional):')
    if (reason === null) return // Usuário cancelou

    setSaving(true)
    try {
      const { data, error } = await apiClient.rejectWorkshop(workshopId, reason || '')

      if (error || !data) {
        showToast.error('Erro ao rejeitar', error || 'Não foi possível rejeitar a oficina')
        return
      }

      showToast.success('Oficina rejeitada', 'A oficina foi rejeitada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao rejeitar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
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
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
        >
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

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Approve/Reject Actions (only if pending) */}
              {workshop.status === 'pendente' && (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Aprovar Oficina
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Rejeitar Oficina
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              
              {/* Save/Cancel Actions */}
              <div className="flex gap-4">
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
        </motion.div>
      </motion.div>
    </div>
  )
}


import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Save, X, Check, CheckCircle, XCircle } from 'lucide-react'
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
}

export default function EditWorkshopPage() {
  const router = useRouter()
  const params = useParams()
  const workshopId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState<Partial<Workshop>>({})

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      showToast.error('Não autenticado', 'Faça login para continuar')
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadWorkshop()
  }, [workshopId, router])

  const loadWorkshop = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao carregar oficina', error || 'Não foi possível carregar os dados')
        router.push('/dashboard/workshops')
        return
      }

      const workshopData = data.data || data
      
      // Garantir que description existe (mesmo que null)
      const normalizedData = {
        ...workshopData,
        description: workshopData.description ?? null
      }
      
      setWorkshop(normalizedData as Workshop)
      setFormData(normalizedData as Workshop)
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
      const { data, error } = await apiClient.updateWorkshop(workshopId, formData)

      if (error || !data) {
        showToast.error('Erro ao salvar', error || 'Não foi possível salvar as alterações')
        return
      }

      showToast.success('Oficina atualizada!', 'As alterações foram salvas com sucesso')
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

  const handleApprove = async () => {
    setSaving(true)
    try {
      const { data, error } = await apiClient.approveWorkshop(workshopId)

      if (error || !data) {
        showToast.error('Erro ao aprovar', error || 'Não foi possível aprovar a oficina')
        return
      }

      showToast.success('Oficina aprovada!', 'A oficina foi aprovada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao aprovar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Motivo da rejeição (opcional):')
    if (reason === null) return // Usuário cancelou

    setSaving(true)
    try {
      const { data, error } = await apiClient.rejectWorkshop(workshopId, reason || '')

      if (error || !data) {
        showToast.error('Erro ao rejeitar', error || 'Não foi possível rejeitar a oficina')
        return
      }

      showToast.success('Oficina rejeitada', 'A oficina foi rejeitada com sucesso')
      setTimeout(() => {
        router.push('/dashboard/workshops')
      }, 1000)
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao rejeitar a oficina')
      console.error('Erro:', error)
    } finally {
      setSaving(false)
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
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
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
        >
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

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Approve/Reject Actions (only if pending) */}
              {workshop.status === 'pendente' && (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Aprovar Oficina
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Rejeitar Oficina
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              
              {/* Save/Cancel Actions */}
              <div className="flex gap-4">
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
        </motion.div>
      </motion.div>
    </div>
  )
}

