'use client'

import { apiClient } from '@/lib/api'
import {
  AlertCircle, Check, DollarSign, ExternalLink, Loader2, Mail,
  MessageSquare, Percent, Settings, Shield,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface WorkshopOverride {
  id: number
  name: string
  email: string
  fee: number | null
}

interface FeeSettings {
  global_fee: number
  overrides: WorkshopOverride[]
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(null)
  const [workshopFeeEdit, setWorkshopFeeEdit] = useState<{ id: number; fee: string } | null>(null)
  const [supportWhatsapp, setSupportWhatsapp] = useState('5511999999999')
  const [supportEmail, setSupportEmail] = useState('suporte@mecabr.com')
  const [editingContacts, setEditingContacts] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadSettings()
    const savedWa = localStorage.getItem('meca_support_whatsapp')
    const savedEmail = localStorage.getItem('meca_support_email')
    if (savedWa) setSupportWhatsapp(savedWa)
    if (savedEmail) setSupportEmail(savedEmail)
  }, [router])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      const { data } = await apiClient.getMecaFeeSettings({ workshopId: '' })
      if (data) {
        const body = data as Record<string, unknown>
        const d = body.data as FeeSettings | undefined
        setFeeSettings(d ?? null)
      }
    } catch {
      setError('Erro ao carregar configurações')
    }
    setLoading(false)
  }

  const handleSaveWorkshopFee = async () => {
    if (!workshopFeeEdit) return
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) return
      apiClient.setToken(token)
      const feeValue = parseFloat(workshopFeeEdit.fee.replace(',', '.'))
      if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
        setError('Taxa deve ser entre 0 e 100')
        setSaving(false)
        return
      }

      const res = await apiClient.updateMecaFeeSettings({
        workshop_id: workshopFeeEdit.id,
        workshop_fee: feeValue / 100,
      })

      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        setWorkshopFeeEdit(null)
        loadSettings()
      } else {
        setError(res.error || 'Erro ao salvar')
      }
    } catch {
      setError('Erro ao salvar configuração')
    }
    setSaving(false)
  }

  const globalFeePercent = feeSettings ? Math.round(feeSettings.global_fee * 100) : 12

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Configurações</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configurações globais da plataforma MECA</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success / Error messages */}
            {saved && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                <Check className="w-4 h-4" />
                Configuração salva com sucesso
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Section: MECA Fee */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-[#00c977]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Taxa MECA</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Percentual cobrado sobre cada transação</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Taxa global padrão</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Aplicada a todas as oficinas sem override</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-[#00c977]" />
                    <span className="text-2xl font-bold text-[#00c977]">{globalFeePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Per-workshop overrides */}
              {feeSettings && feeSettings.overrides.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Overrides por oficina ({feeSettings.overrides.length})
                  </h3>
                  <div className="space-y-2">
                    {feeSettings.overrides.map(wo => (
                      <div
                        key={wo.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{wo.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{wo.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {workshopFeeEdit?.id === wo.id ? (
                            <>
                              <input
                                type="text"
                                value={workshopFeeEdit.fee}
                                onChange={e => setWorkshopFeeEdit({ ...workshopFeeEdit, fee: e.target.value })}
                                className="w-20 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#00c977]"
                                placeholder="12"
                              />
                              <span className="text-sm text-gray-500">%</span>
                              <button
                                onClick={handleSaveWorkshopFee}
                                disabled={saving}
                                className="px-3 py-1 text-xs font-medium text-white bg-[#00c977] rounded-lg hover:bg-[#00b369] disabled:opacity-50 transition-colors"
                              >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar'}
                              </button>
                              <button
                                onClick={() => setWorkshopFeeEdit(null)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                {wo.fee != null ? `${Math.round(wo.fee * 100)}%` : `${globalFeePercent}%`}
                              </span>
                              <button
                                onClick={() => setWorkshopFeeEdit({
                                  id: wo.id,
                                  fee: wo.fee != null ? String(Math.round(wo.fee * 100)) : String(globalFeePercent),
                                })}
                                className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Editar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section: Support Contacts */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contatos de Suporte</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Links exibidos para oficinas e clientes</p>
                  </div>
                </div>
                {!editingContacts ? (
                  <button
                    onClick={() => setEditingContacts(true)}
                    className="text-sm text-[#00c977] hover:underline font-medium"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingContacts(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('meca_support_whatsapp', supportWhatsapp)
                        localStorage.setItem('meca_support_email', supportEmail)
                        setEditingContacts(false)
                      }}
                      className="text-sm text-white bg-[#00c977] px-3 py-1 rounded-lg hover:bg-[#00b36b] font-medium"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Suporte</span>
                  </div>
                  {editingContacts ? (
                    <input
                      type="text"
                      value={supportWhatsapp}
                      onChange={e => setSupportWhatsapp(e.target.value.replace(/\D/g, ''))}
                      placeholder="5511999999999"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                    />
                  ) : (
                    <a
                      href={`https://wa.me/${supportWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      wa.me/{supportWhatsapp}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Suporte</span>
                  </div>
                  {editingContacts ? (
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                      placeholder="suporte@mecabr.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm text-gray-900 dark:text-white">{supportEmail}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Platform Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plataforma</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Informações sobre a versão e ambiente</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">API URL</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">api.mecabr.com</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Admin</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">v2.9.0</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ambiente</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                    Produção
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
