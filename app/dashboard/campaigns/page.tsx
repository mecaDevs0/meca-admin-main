'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Send, Users, Clock, AlertTriangle, CheckCircle2,
  XCircle, Target, UserX, UserMinus, ChevronRight, ChevronLeft,
  Smartphone, Wifi, WifiOff, BarChart3,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface Segment {
  label: string
  count: number
}

interface Campaign {
  id: number
  title: string
  message: string
  segment: string
  segment_label: string
  status: string
  target_count: number
  sent_count: number
  failed_count: number
  created_by: string
  created_at: string
  sent_at: string
}

interface DiagnosticSummary {
  user_type: string
  unique_users: number
  total_tokens: number
  likely_duplicates: number
}

const SEGMENT_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  all_customers: Users,
  never_booked: UserX,
  inactive_7d: UserMinus,
  inactive_30d: UserMinus,
  has_booked: CheckCircle2,
  all_workshops: Target,
}

const SEGMENT_COLORS: Record<string, string> = {
  all_customers: '#00C977',
  never_booked: '#EF4444',
  inactive_7d: '#F59E0B',
  inactive_30d: '#EF4444',
  has_booked: '#3B82F6',
  all_workshops: '#8B5CF6',
}

const WIZARD_STEPS = ['Segmento', 'Mensagem', 'Preview', 'Enviar']

function MobilePreview({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto w-[260px]">
      {/* Phone frame */}
      <div
        className="rounded-[28px] p-3 shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '3px solid #2a2a4a',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5">
          <span className="text-[9px] font-semibold text-white/80">9:41</span>
          <div className="flex items-center gap-1">
            <Wifi size={10} className="text-white/80" />
            <div className="w-5 h-2.5 rounded-sm border border-white/50 relative">
              <div className="absolute inset-0.5 bg-green-400 rounded-[1px]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* Notification */}
        <div
          className="mx-1 mt-2 rounded-2xl p-3.5"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00C977] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">M</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white/60">MECA</span>
                <span className="text-[8px] text-white/40">agora</span>
              </div>
              <p className="text-[11px] font-semibold text-white mt-0.5 leading-snug">
                {title || 'Título da notificação'}
              </p>
              <p className="text-[10px] text-white/70 mt-0.5 leading-snug line-clamp-3">
                {message || 'Corpo da mensagem aparece aqui...'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-10" />
        <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mb-1" />
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const [segments, setSegments] = useState<Record<string, Segment>>({})
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsToday, setCampaignsToday] = useState(0)
  const [maxPerDay, setMaxPerDay] = useState(3)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [wizardStep, setWizardStep] = useState(0)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')

  const [diagnostic, setDiagnostic] = useState<DiagnosticSummary[]>([])
  const [diagnosticLoading, setDiagnosticLoading] = useState(false)
  const [showDiagnostic, setShowDiagnostic] = useState(false)

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
      const [segRes, campRes] = await Promise.all([
        apiClient.getPushCampaignSegments(),
        apiClient.getPushCampaigns(),
      ])
      if (segRes.data && !segRes.error) {
        const d = segRes.data as { segments?: Record<string, Segment>; campaigns_today?: number; max_campaigns_per_day?: number }
        setSegments(d.segments ?? {})
        setCampaignsToday(d.campaigns_today ?? 0)
        setMaxPerDay(d.max_campaigns_per_day ?? 3)
      }
      if (campRes.data && !campRes.error) {
        const d = campRes.data as { campaigns?: Campaign[] }
        setCampaigns(d.campaigns ?? [])
      }
    } catch {
      showToast.error('Erro', 'Não foi possível carregar dados')
    }
    setLoading(false)
  }

  const loadDiagnostic = async () => {
    setDiagnosticLoading(true)
    try {
      const { data, error } = await apiClient.getNotificationDiagnostic()
      if (data && !error) {
        const body = data as Record<string, unknown>
        setDiagnostic(Array.isArray(body.summary) ? body.summary as DiagnosticSummary[] : [])
      }
    } catch { /* silent */ }
    setDiagnosticLoading(false)
    setShowDiagnostic(true)
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || !selectedSegment) return
    if (campaignsToday >= maxPerDay) {
      showToast.error('Limite atingido', `Máximo de ${maxPerDay} campanhas por dia`)
      return
    }
    setSending(true)
    try {
      const { data, error } = await apiClient.createPushCampaign({
        title: title.trim(),
        message: message.trim(),
        segment: selectedSegment,
      })
      if (error) {
        const errData = data as { error?: string } | null
        showToast.error('Erro ao enviar', errData?.error ?? 'Falha no envio')
        setSending(false)
        return
      }
      const result = data as { message?: string }
      showToast.success('Campanha enviada!', result.message ?? 'Push enviado com sucesso')
      setTitle('')
      setMessage('')
      setSelectedSegment('')
      setWizardStep(0)
      loadData()
    } catch {
      showToast.error('Erro', 'Falha ao enviar campanha')
    }
    setSending(false)
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const canAdvance = useMemo(() => {
    if (wizardStep === 0) return !!selectedSegment
    if (wizardStep === 1) return !!title.trim() && !!message.trim()
    return true
  }, [wizardStep, selectedSegment, title, message])

  const campaignStats = useMemo(() => {
    if (campaigns.length === 0) return null
    const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0)
    const totalTarget = campaigns.reduce((s, c) => s + c.target_count, 0)
    const totalFailed = campaigns.reduce((s, c) => s + c.failed_count, 0)
    return { totalSent, totalTarget, totalFailed, count: campaigns.length }
  }, [campaigns])

  const itemVariants = { hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00c977] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-3 sm:p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.06 }}
        className="max-w-[1920px] mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Campanhas Push</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {campaignsToday}/{maxPerDay} campanhas enviadas hoje
              </p>
            </div>
          </div>
          <button
            onClick={loadDiagnostic}
            disabled={diagnosticLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {diagnosticLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            Diagnóstico Tokens
          </button>
        </motion.div>

        {/* Rate limit warning */}
        {campaignsToday >= maxPerDay && (
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Limite de {maxPerDay} campanhas por dia atingido. Tente novamente amanhã.
            </p>
          </motion.div>
        )}

        {/* Device Token Diagnostic */}
        <AnimatePresence>
          {showDiagnostic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#00C977]" />
                    <span className="text-sm font-semibold text-[#252940] dark:text-white">Diagnóstico de Device Tokens</span>
                  </div>
                  <button
                    onClick={() => setShowDiagnostic(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                {diagnostic.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {diagnostic.map(d => (
                      <div
                        key={d.user_type}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {d.user_type === 'customer' ? <Users className="w-4 h-4 text-[#00C977]" /> : <Target className="w-4 h-4 text-purple-500" />}
                          <span className="text-sm font-semibold text-[#252940] dark:text-white capitalize">{d.user_type === 'customer' ? 'Clientes' : 'Oficinas'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-lg font-bold text-[#252940] dark:text-white">{d.unique_users}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Usuários</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#00C977]">{d.total_tokens}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Tokens</p>
                          </div>
                          <div>
                            <p className={`text-lg font-bold ${d.likely_duplicates > 0 ? 'text-amber-500' : 'text-gray-400'}`}>{d.likely_duplicates}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Duplicados</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum dado de diagnóstico disponível.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm overflow-hidden"
        >
          {/* Wizard steps indicator */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              {WIZARD_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <button
                    onClick={() => { if (i < wizardStep) setWizardStep(i) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      i === wizardStep
                        ? 'bg-[#00c977] text-white shadow-md'
                        : i < wizardStep
                        ? 'bg-[#00c977]/10 text-[#00c977] cursor-pointer hover:bg-[#00c977]/20'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">{i + 1}</span>
                    <span className="hidden sm:inline">{step}</span>
                  </button>
                  {i < WIZARD_STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />}
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {/* Step 0: Segment */}
              {wizardStep === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-1">Selecione o segmento</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Para quem você quer enviar esta campanha?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(segments).map(([key, seg]) => {
                      const Icon = SEGMENT_ICONS[key] ?? Users
                      const color = SEGMENT_COLORS[key] ?? '#6B7280'
                      const active = selectedSegment === key
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedSegment(key)}
                          className="p-4 rounded-2xl border-2 text-left transition-all"
                          style={{
                            borderColor: active ? color : 'transparent',
                            background: active ? `${color}10` : 'var(--color-gray-100, rgba(0,0,0,0.04))',
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <p className="text-sm font-semibold text-[#252940] dark:text-white">{seg.label}</p>
                          <p className="text-xs mt-0.5" style={{ color }}>{seg.count} usuários</p>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Message */}
              {wizardStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-1">Escreva a mensagem</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Título e corpo da notificação push</p>
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Agende sua revisão com desconto!"
                        maxLength={100}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-[#252940] dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/100</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ex: Sua última manutenção foi há mais de 3 meses. Que tal agendar uma revisão?"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-[#252940] dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm resize-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-right">{message.length}/500</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Preview */}
              {wizardStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-1">Preview</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Como a notificação aparecerá no celular do usuário</p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    <MobilePreview title={title} message={message} />
                    <div className="flex-1 space-y-3">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Segmento</p>
                        <p className="text-sm font-semibold text-[#252940] dark:text-white">
                          {segments[selectedSegment]?.label ?? selectedSegment}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {segments[selectedSegment]?.count ?? 0} destinatários
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Título</p>
                        <p className="text-sm font-semibold text-[#252940] dark:text-white">{title}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Mensagem</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirm & Send */}
              {wizardStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-1">Confirmar envio</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                    A campanha será enviada imediatamente para <strong>{segments[selectedSegment]?.count ?? 0}</strong> usuários
                  </p>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#00c977]/5 border border-[#00c977]/20 mb-6 max-w-lg">
                    <Megaphone className="w-8 h-8 text-[#00c977] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#252940] dark:text-white">{title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{message}</p>
                      <p className="text-[10px] text-[#00c977] mt-1 font-medium">
                        → {segments[selectedSegment]?.label} ({segments[selectedSegment]?.count} destinatários)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={sending || campaignsToday >= maxPerDay}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00c977] to-[#00b369] hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Campanha
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wizard navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setWizardStep(s => Math.max(0, s - 1))}
                disabled={wizardStep === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              {wizardStep < 3 && (
                <button
                  onClick={() => setWizardStep(s => Math.min(3, s + 1))}
                  disabled={!canAdvance}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#00c977] text-white hover:bg-[#00b369] disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 transition-colors"
                >
                  Avançar <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Campaign stats */}
        {campaignStats && (
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Campanhas', value: campaignStats.count, icon: Megaphone, gradient: 'from-[#00c977] to-[#00b369]' },
              { label: 'Total Enviados', value: campaignStats.totalSent, icon: Send, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Total Alvo', value: campaignStats.totalTarget, icon: Target, gradient: 'from-purple-500 to-purple-600' },
              { label: 'Falhas', value: campaignStats.totalFailed, icon: XCircle, gradient: 'from-red-500 to-red-600' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-sm"
              >
                <div className={`w-9 h-9 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-[#252940] dark:text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Campaign History */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-[#252940] dark:text-white">Histórico de Campanhas</h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma campanha enviada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c, i) => {
                const Icon = SEGMENT_ICONS[c.segment] ?? Users
                const color = SEGMENT_COLORS[c.segment] ?? '#6B7280'
                const successRate = c.target_count > 0 ? Math.round((c.sent_count / c.target_count) * 100) : 0
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#252940] dark:text-white text-sm truncate">{c.title}</h3>
                          {c.status === 'sent' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{c.message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#252940] dark:text-white">{successRate}%</p>
                        <p className="text-[10px] text-gray-400">entregues</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon className="w-3 h-3" />
                        {c.segment_label}
                      </span>
                      <span>{c.sent_count}/{c.target_count} enviados</span>
                      {c.failed_count > 0 && <span className="text-red-400">{c.failed_count} falhas</span>}
                      <span className="ml-auto text-gray-400">{formatDate(c.sent_at || c.created_at)}</span>
                    </div>
                    {/* Delivery progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${successRate}%`,
                          backgroundColor: successRate > 90 ? '#00C977' : successRate > 50 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
