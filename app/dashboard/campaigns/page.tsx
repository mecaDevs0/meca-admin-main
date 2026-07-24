'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  Megaphone, Send, Users, Clock, AlertTriangle, CheckCircle2,
  XCircle, Target, UserX, UserMinus
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

const SEGMENT_ICONS: Record<string, React.ReactNode> = {
  all_customers: <Users className="w-4 h-4" />,
  never_booked: <UserX className="w-4 h-4" />,
  inactive_7d: <UserMinus className="w-4 h-4" />,
  inactive_30d: <UserMinus className="w-4 h-4" />,
  has_booked: <CheckCircle2 className="w-4 h-4" />,
  all_workshops: <Target className="w-4 h-4" />,
}

export default function CampaignsPage() {
  const router = useRouter()
  const [segments, setSegments] = useState<Record<string, Segment>>({})
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsToday, setCampaignsToday] = useState(0)
  const [maxPerDay, setMaxPerDay] = useState(3)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')

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
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || !selectedSegment) {
      showToast.error('Campos obrigatórios', 'Preencha título, mensagem e selecione um segmento')
      return
    }

    const segmentInfo = segments[selectedSegment]
    if (!segmentInfo || segmentInfo.count === 0) {
      showToast.error('Segmento vazio', 'Não há usuários neste segmento')
      return
    }

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
        return
      }

      const result = data as { message?: string; campaign?: Campaign }
      showToast.success('Campanha enviada!', result.message ?? 'Push enviado com sucesso')
      setTitle('')
      setMessage('')
      setSelectedSegment('')
      loadData()
    } catch {
      showToast.error('Erro', 'Falha ao enviar campanha')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
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
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#00c977]/10">
            <Megaphone className="w-6 h-6 text-[#00c977]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campanhas Push</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Envie notificações push para segmentos de clientes. Máximo {maxPerDay} campanhas por dia.
        </p>
      </div>

      {/* Rate limit warning */}
      {campaignsToday >= maxPerDay && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Limite de {maxPerDay} campanhas por dia atingido ({campaignsToday}/{maxPerDay}). Tente novamente amanhã.
          </p>
        </div>
      )}

      {/* Create Campaign Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-[#00c977]" />
          Nova Campanha
          <span className="ml-auto text-xs font-normal text-gray-400">
            {campaignsToday}/{maxPerDay} hoje
          </span>
        </h2>

        {/* Segment Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Segmento
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(segments).map(([key, seg]) => (
              <button
                key={key}
                onClick={() => setSelectedSegment(key)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${
                  selectedSegment === key
                    ? 'border-[#00c977] bg-[#00c977]/10 text-[#00c977] dark:text-[#00e88a]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <span className="flex-shrink-0">{SEGMENT_ICONS[key] ?? <Users className="w-4 h-4" />}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">{seg.label}</span>
                  <span className={`block text-xs ${
                    selectedSegment === key ? 'text-[#00c977]/70' : 'text-gray-400'
                  }`}>
                    {seg.count} {seg.count === 1 ? 'usuário' : 'usuários'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título da notificação
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Agende sua revisão com desconto!"
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Sua última manutenção foi há mais de 3 meses. Que tal agendar uma revisão? Use o código PRIMEIRA para 15% de desconto!"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00c977] focus:ring-1 focus:ring-[#00c977] outline-none text-sm resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{message.length}/500</p>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim() || !selectedSegment || campaignsToday >= maxPerDay}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00c977] hover:bg-[#00b36b] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar para {segments[selectedSegment]?.count ?? 0} usuários
            </>
          )}
        </button>
      </motion.div>

      {/* Campaign History */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Histórico de Campanhas
        </h2>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma campanha enviada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {c.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {c.status === 'sent' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {SEGMENT_ICONS[c.segment] ?? <Users className="w-3 h-3" />}
                    {c.segment_label}
                  </span>
                  <span>{c.sent_count}/{c.target_count} enviados</span>
                  {c.failed_count > 0 && (
                    <span className="text-red-400">{c.failed_count} falhas</span>
                  )}
                  <span className="ml-auto">{formatDate(c.sent_at || c.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
