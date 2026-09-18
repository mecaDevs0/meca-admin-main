'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  Ticket, Plus, ToggleLeft, ToggleRight, Percent, DollarSign,
  Calendar, Users, TrendingUp, Clock, Hash, Zap, RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PromoCode {
  id: number
  code: string
  description: string | null
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number | null
  current_uses: number
  min_booking_value: number
  valid_from: string
  valid_until: string | null
  first_booking_only: boolean
  active: boolean
  created_by: string
  created_at: string
  total_uses: number
  total_discount_given: number
  source?: string
  starts_at?: string
  service_type?: string
  customer_id?: string
}

interface Stats {
  active_codes: number
  total_codes: number
  total_uses: number
  total_discount_given: number
}

export default function PromoCodesPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [showFlashForm, setShowFlashForm] = useState(false)
  const [creatingFlash, setCreatingFlash] = useState(false)
  const [flashPercent, setFlashPercent] = useState('8')
  const [flashServiceType, setFlashServiceType] = useState('')
  const [flashMaxUses, setFlashMaxUses] = useState('50')
  const [flashDuration, setFlashDuration] = useState('24')
  const [flashMinValue, setFlashMinValue] = useState('15000')
  const [reactivationStats, setReactivationStats] = useState<Record<string, number> | null>(null)

  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage')
  const [formValue, setFormValue] = useState('')
  const [formMaxUses, setFormMaxUses] = useState('')
  const [formMinBooking, setFormMinBooking] = useState('')
  const [formValidUntil, setFormValidUntil] = useState('')
  const [formFirstOnly, setFormFirstOnly] = useState(false)

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
      const [codesRes, statsRes, reactRes] = await Promise.all([
        apiClient.getPromoCodes(),
        apiClient.getPromoCodeStats(),
        apiClient.getReactivationStats().catch(() => ({ data: null, error: true })),
      ])

      if (codesRes.data && !codesRes.error) {
        const d = codesRes.data as { promo_codes?: PromoCode[] }
        setCodes(d.promo_codes ?? [])
      }

      if (statsRes.data && !statsRes.error) {
        const d = statsRes.data as { stats?: Stats }
        setStats(d.stats ?? null)
      }

      if (reactRes.data && !reactRes.error) {
        const d = reactRes.data as { stats?: Record<string, number> }
        setReactivationStats(d.stats ?? null)
      }
    } catch {
      showToast.error('Erro', 'Não foi possível carregar cupons')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formCode.trim() || !formValue) {
      showToast.error('Campos obrigatórios', 'Preencha código e valor')
      return
    }

    const numValue = parseFloat(formValue)
    if (formType === 'percentage' && (numValue <= 0 || numValue > 12)) {
      showToast.error('Valor inválido', 'Percentual deve ser entre 1% e 12%')
      return
    }
    if (formType === 'fixed' && numValue <= 0) {
      showToast.error('Valor inválido', 'Valor fixo deve ser maior que R$0')
      return
    }

    const minBookingCents = formMinBooking ? Math.round(parseFloat(formMinBooking) * 100) : undefined

    setCreating(true)
    try {
      const { data, error } = await apiClient.createPromoCode({
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim() || undefined,
        type: formType,
        value: numValue,
        max_uses: formMaxUses ? parseInt(formMaxUses) : undefined,
        min_booking_value: minBookingCents,
        valid_until: formValidUntil || undefined,
        first_booking_only: formFirstOnly,
      })

      if (error) {
        const errData = data as { error?: string } | null
        showToast.error('Erro ao criar', errData?.error ?? 'Falha na criação')
        return
      }

      showToast.success('Cupom criado!', `Código ${formCode.toUpperCase()} criado com sucesso`)
      resetForm()
      loadData()
    } catch {
      showToast.error('Erro', 'Falha ao criar cupom')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const { error } = await apiClient.togglePromoCode(id)
      if (error) {
        showToast.error('Erro', 'Falha ao alterar status')
        return
      }
      loadData()
    } catch {
      showToast.error('Erro', 'Falha ao alterar status')
    }
  }

  const handleCreateFlash = async () => {
    const percent = parseFloat(flashPercent)
    if (!percent || percent < 1 || percent > 12) {
      showToast.error('Desconto inválido', 'Deve ser entre 1% e 12%')
      return
    }
    setCreatingFlash(true)
    try {
      const { data, error } = await apiClient.createFlashCoupon({
        discountPercent: percent,
        serviceType: flashServiceType || undefined,
        maxUses: parseInt(flashMaxUses) || 50,
        durationHours: parseInt(flashDuration) || 24,
        minBookingValue: parseInt(flashMinValue) || 15000,
      })
      if (error) {
        const errData = data as { error?: string } | null
        showToast.error('Erro', errData?.error ?? 'Falha ao criar flash')
        return
      }
      const d = data as { push_recipients?: number }
      showToast.success('Flash criado!', `Push enviada para ${d.push_recipients ?? 0} clientes`)
      setShowFlashForm(false)
      loadData()
    } catch {
      showToast.error('Erro', 'Falha ao criar cupom flash')
    } finally {
      setCreatingFlash(false)
    }
  }

  const resetForm = () => {
    setFormCode('')
    setFormDescription('')
    setFormType('percentage')
    setFormValue('')
    setFormMaxUses('')
    setFormMinBooking('')
    setFormValidUntil('')
    setFormFirstOnly(false)
    setShowForm(false)
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    })
  }

  const formatCurrency = (v: number) => {
    return `R$${v.toFixed(2).replace('.', ',')}`
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00c977] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00c977]/10">
              <Ticket className="w-6 h-6 text-[#00c977]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cupons Promocionais</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowFlashForm(!showFlashForm); setShowForm(false) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors"
            >
              <Zap className="w-4 h-4" />
              Criar Flash
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setShowFlashForm(false) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00c977] hover:bg-[#00b36b] text-white font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Cupom
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie cupons de desconto para aquisição e retenção de clientes
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Cupons Ativos', value: stats.active_codes, icon: <Ticket className="w-4 h-4" /> },
            { label: 'Total Cupons', value: stats.total_codes, icon: <Hash className="w-4 h-4" /> },
            { label: 'Total Usos', value: stats.total_uses, icon: <Users className="w-4 h-4" /> },
            { label: 'Desconto Total', value: formatCurrency(stats.total_discount_given), icon: <TrendingUp className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                {stat.icon}
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Flash Form */}
      {showFlashForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700/50 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Cupom Flash 24h
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desconto (%)</label>
              <input type="number" value={flashPercent} onChange={(e) => setFlashPercent(e.target.value)}
                min="1" max="12" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Servico (opcional)</label>
              <input type="text" value={flashServiceType} onChange={(e) => setFlashServiceType(e.target.value)}
                placeholder="Ex: Troca de oleo" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Usos</label>
              <input type="number" value={flashMaxUses} onChange={(e) => setFlashMaxUses(e.target.value)}
                min="1" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duracao</label>
              <select value={flashDuration} onChange={(e) => setFlashDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none">
                <option value="12">12 horas</option>
                <option value="24">24 horas</option>
                <option value="48">48 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Min (centavos)</label>
              <input type="number" value={flashMinValue} onChange={(e) => setFlashMinValue(e.target.value)}
                min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              <p className="text-xs text-gray-400 mt-1">15000 = R$150</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleCreateFlash} disabled={creatingFlash}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold text-sm transition-colors flex items-center gap-2">
              {creatingFlash ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Criando...</>
              ) : (
                <><Zap className="w-4 h-4" /> Criar Flash + Enviar Push</>
              )}
            </button>
            <button onClick={() => setShowFlashForm(false)}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#00c977]" />
            Novo Cupom
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="Ex: PRIMEIRA"
                maxLength={30}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm uppercase"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType('percentage')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formType === 'percentage'
                      ? 'border-[#00c977] bg-[#00c977]/10 text-[#00c977]'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  Percentual
                </button>
                <button
                  onClick={() => setFormType('fixed')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formType === 'fixed'
                      ? 'border-[#00c977] bg-[#00c977]/10 text-[#00c977]'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Valor Fixo
                </button>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {formType === 'percentage' ? 'Desconto (%) — máx 12%' : 'Desconto em Reais (R$)'}
              </label>
              <div className="relative">
                {formType === 'fixed' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">R$</span>
                )}
                <input
                  type="number"
                  value={formValue}
                  onChange={(e) => {
                    const v = e.target.value
                    if (formType === 'percentage' && parseFloat(v) > 12) return
                    setFormValue(v)
                  }}
                  placeholder={formType === 'percentage' ? 'Ex: 5' : 'Ex: 100.00'}
                  min="0"
                  max={formType === 'percentage' ? '12' : undefined}
                  step={formType === 'percentage' ? '1' : '0.01'}
                  className={`w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm ${formType === 'fixed' ? 'pl-10 pr-4' : 'px-4'}`}
                />
              </div>
              {formType === 'percentage' && (
                <p className="text-xs text-gray-400 mt-1">MECA absorve o desconto da comissao de 12%</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ex: Desconto no primeiro agendamento"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite de usos</label>
              <input
                type="number"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                placeholder="Vazio = ilimitado"
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm"
              />
            </div>

            {/* Min Booking Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor mínimo do serviço (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">R$</span>
                <input
                  type="number"
                  value={formMinBooking}
                  onChange={(e) => setFormMinBooking(e.target.value)}
                  placeholder="Ex: 700.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Vazio = sem valor mínimo. Cupom só vale para serviços acima deste valor.</p>
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Válido até</label>
              <input
                type="date"
                value={formValidUntil}
                onChange={(e) => setFormValidUntil(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm"
              />
            </div>

            {/* First Booking Only */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormFirstOnly(!formFirstOnly)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formFirstOnly ? 'bg-[#00c977]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  formFirstOnly ? 'translate-x-5' : ''
                }`} />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">Apenas primeiro agendamento</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={creating || !formCode.trim() || !formValue}
              className="px-6 py-2.5 rounded-xl bg-[#00c977] hover:bg-[#00b36b] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold text-sm transition-colors flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Criar Cupom
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {/* Promo Codes List */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Cupons Cadastrados
        </h2>

        {codes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum cupom cadastrado ainda</p>
            <p className="text-xs mt-1">Clique em &quot;Novo Cupom&quot; para criar o primeiro</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((pc) => (
              <div
                key={pc.id}
                className={`p-4 rounded-xl border transition-colors ${
                  pc.active
                    ? 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                    : 'border-gray-100 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#00c977]/10 text-[#00c977] font-mono font-bold text-sm">
                        {pc.code}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        pc.active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {pc.active ? 'Ativo' : 'Inativo'}
                      </span>
                      {pc.first_booking_only && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                          1o booking
                        </span>
                      )}
                      {pc.source === 'flash' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                          <Zap className="w-3 h-3" /> Flash
                        </span>
                      )}
                      {pc.source === 'reactivation' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
                          <RefreshCw className="w-3 h-3" /> Reativacao
                        </span>
                      )}
                      {pc.source === 'referral' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-medium">
                          Indicacao
                        </span>
                      )}
                      {pc.source === 'review' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-medium">
                          Avaliacao
                        </span>
                      )}
                    </div>
                    {pc.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {pc.type === 'percentage' ? `${pc.value}%` : formatCurrency(pc.value)}
                    </span>
                    <button
                      onClick={() => handleToggle(pc.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={pc.active ? 'Desativar' : 'Ativar'}
                    >
                      {pc.active ? (
                        <ToggleRight className="w-6 h-6 text-[#00c977]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {pc.current_uses}{pc.max_uses ? `/${pc.max_uses}` : ''} usos
                  </span>
                  {pc.min_booking_value > 0 && (
                    <span>Min: {formatCurrency(pc.min_booking_value / 100)}</span>
                  )}
                  {pc.valid_until && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Até {formatDate(pc.valid_until)}
                    </span>
                  )}
                  {pc.total_discount_given > 0 && (
                    <span className="text-[#00c977]">
                      Desconto dado: {formatCurrency(pc.total_discount_given)}
                    </span>
                  )}
                  <span className="ml-auto">Criado {formatDate(pc.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Reactivation Stats */}
      {reactivationStats && (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-500" />
            Reativacao de Clientes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Enviados', value: reactivationStats.total_sent || 0 },
              { label: 'Nivel 1 (5%)', value: `${reactivationStats.l1_sent || 0} env / ${reactivationStats.l1_used || 0} usados` },
              { label: 'Nivel 2 (7%)', value: `${reactivationStats.l2_sent || 0} env / ${reactivationStats.l2_used || 0} usados` },
              { label: 'Nivel 3 (10%)', value: `${reactivationStats.l3_sent || 0} env / ${reactivationStats.l3_used || 0} usados` },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                <span className="text-xs text-gray-400">{stat.label}</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Taxa de conversao: {reactivationStats.conversion_rate || 0}% — Clientes recuperados: {reactivationStats.total_used || 0}
          </div>
        </div>
      )}
    </div>
  )
}
