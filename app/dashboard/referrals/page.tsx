'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  UserPlus, Users, Gift, Clock, TrendingUp, CheckCircle
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
    } catch (err) {
      console.error('Erro ao carregar stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { label: 'Clientes Indicados', value: stats.total_referred, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Indicações com Sucesso', value: stats.successful_referrals, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Indicações Pendentes', value: stats.pending_referrals, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Indicadores Ativos', value: stats.active_referrers, icon: UserPlus, color: 'from-purple-500 to-purple-600' },
    { label: 'Total em Recompensas', value: `R$ ${Number(stats.total_rewards_given || 0).toFixed(2)}`, icon: Gift, color: 'from-pink-500 to-pink-600' },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c977]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-[#00c977]" />
            Indique e Ganhe (B2C)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Programa de indicação cliente-a-cliente — cada indicação com 1º agendamento pago gera R$10 para ambos
          </p>
        </div>
        <motion.button
          onClick={loadData}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition"
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Atualizar
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${card.color}`} />
            <div className="relative">
              <card.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {card.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Cliente compartilha', desc: 'Cada cliente tem um código único (MECAXXXXX) que pode compartilhar com amigos' },
            { step: '2', title: 'Amigo se cadastra', desc: 'O amigo usa o código durante o cadastro no app' },
            { step: '3', title: 'Amigo faz 1º booking pago', desc: 'Quando o amigo completa o primeiro agendamento pago, o trigger é ativado' },
            { step: '4', title: 'Ambos ganham R$10', desc: 'Cupom de R$10 criado automaticamente para indicador e indicado' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <div className="w-10 h-10 rounded-full bg-[#00c977] text-white flex items-center justify-center font-bold text-lg mb-3">
                {item.step}
              </div>
              <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">{item.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Technical details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Detalhes do Programa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Recompensa por indicação</span>
              <span className="font-medium text-[#00c977]">R$ 10,00</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Formato do código</span>
              <span className="font-mono">MECA + 5 chars</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Quem paga o desconto</span>
              <span className="font-medium">Taxa MECA (12%)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Booking mínimo para cupom</span>
              <span className="font-medium">R$ 50,00</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Cupom uso único</span>
              <span className="font-medium">Sim</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Oficina recebe</span>
              <span className="font-medium text-[#00c977]">100% do valor</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
