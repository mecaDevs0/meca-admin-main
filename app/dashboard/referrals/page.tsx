'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  UserPlus, Users, Gift, Clock, CheckCircle, RefreshCw,
  ArrowRight, Share2, CalendarCheck, Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ReferralStats {
  total_referred: number
  successful_referrals: number
  pending_referrals: number
  total_rewards_given: number
  active_referrers: number
}

const STEPS = [
  {
    icon: Share2,
    title: 'Compartilha',
    desc: 'Cliente abre o app e compartilha seu código único de indicação com amigos via WhatsApp, SMS ou redes sociais.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    icon: UserPlus,
    title: 'Amigo se cadastra',
    desc: 'O amigo baixa o app MECA e insere o código no cadastro. Fica registrado como indicado.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    icon: CalendarCheck,
    title: 'Faz o 1º agendamento',
    desc: 'O amigo agenda e paga seu primeiro serviço em qualquer oficina parceira. Mínimo R$ 50,00.',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    icon: Gift,
    title: 'Ambos ganham',
    desc: 'Quem indicou e quem foi indicado recebem R$ 10,00 em cupom de desconto para o próximo serviço.',
    color: 'from-[#00c977] to-[#00b369]',
    bg: 'bg-green-50 dark:bg-green-500/10',
  },
]

export default function ReferralsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

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
      const res = await apiClient.getReferralStats()
      if (res.data && !res.error) {
        setStats(res.data as ReferralStats)
      }
    } catch {
      showToast.error('Erro', 'Não foi possível carregar estatísticas de indicações')
    } finally {
      setLoading(false)
    }
  }

  const conversionRate = stats && stats.total_referred > 0
    ? ((stats.successful_referrals / stats.total_referred) * 100).toFixed(1)
    : '0.0'

  const hasData = stats && (stats.total_referred > 0 || stats.active_referrers > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c977]" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg shadow-[#00c977]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Indique e Ganhe</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Programa de indicação entre clientes — aquisição orgânica via boca-a-boca
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Objective banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#00c977]/10 to-[#00b369]/5 dark:from-[#00c977]/10 dark:to-transparent border border-[#00c977]/20 rounded-2xl p-5"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Objetivo do programa</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Cada cliente vira um promotor da MECA. Ao indicar um amigo que faz seu primeiro agendamento pago,
          <strong className="text-[#00c977]"> ambos ganham R$ 10,00 em cupom</strong>. O desconto sai da taxa MECA —
          a oficina sempre recebe 100% do valor do serviço. O custo de aquisição por cliente é fixo e previsível.
        </p>
      </motion.div>

      {/* How it works — step-by-step */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Como funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 relative"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center`}>
                  <step.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">PASSO {i + 1}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-gray-600" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {hasData ? (
        <>
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Resultados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Clientes Indicados', value: stats!.total_referred, icon: Users, iconColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: 'Conversões', value: stats!.successful_referrals, icon: CheckCircle, iconColor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', subtitle: 'completaram 1º booking' },
                { label: 'Pendentes', value: stats!.pending_referrals, icon: Clock, iconColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', subtitle: 'aguardando 1º booking' },
                { label: 'Indicadores Ativos', value: stats!.active_referrers, icon: UserPlus, iconColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', subtitle: 'clientes que indicaram' },
                { label: 'Cupons Emitidos', value: `R$ ${Number(stats!.total_rewards_given || 0).toFixed(2).replace('.', ',')}`, icon: Gift, iconColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10', subtitle: 'custo total do programa' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4"
                >
                  <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
                  {card.subtitle && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{card.subtitle}</div>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Conversion + Rules row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Taxa de Conversão</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{conversionRate}%</span>
                <span className="text-xs text-gray-400 mb-1">indicados → 1º booking pago</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00c977] to-[#00b369] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Number(conversionRate), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {stats!.successful_referrals} de {stats!.total_referred} indicados completaram o primeiro agendamento
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Regras do Programa</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Recompensa por indicação</span>
                  <span className="font-semibold text-[#00c977]">R$ 10,00 cada</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Valor mínimo do 1º booking</span>
                  <span className="font-medium">R$ 50,00</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Formato do código</span>
                  <span className="font-mono text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">MECA + 5 chars</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Quem absorve o custo</span>
                  <span className="font-medium">Taxa MECA</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Oficina recebe</span>
                  <span className="font-semibold text-[#00c977]">100% do serviço</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-14 h-14 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nenhuma indicação ainda</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            O programa está ativo no app. Quando clientes começarem a compartilhar seus códigos de indicação,
            as métricas aparecerão aqui automaticamente.
          </p>
        </motion.div>
      )}
    </div>
  )
}
