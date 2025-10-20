'use client'

import { showToast } from '@/lib/toast'
import { Bell, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NotificationsPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'all' | 'customers' | 'workshops'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const targetText = target === 'all' ? 'todos os usuários' : target === 'customers' ? 'clientes' : 'oficinas'
    
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          target
        })
      })

      const result = await response.json()

      if (response.ok) {
        showToast.success('Notificação enviada!', `Enviada com sucesso para: ${targetText}`)
        setTitle('')
        setMessage('')
      } else {
        showToast.error('Erro ao enviar', result.message || 'Não foi possível enviar a notificação')
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      showToast.error('Erro de conexão', 'Não foi possível enviar a notificação')
    }
    
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00c977] rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notificações</h1>
            <p className="text-sm text-gray-500">Envie notificações para usuários da plataforma</p>
          </div>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Notificação</h2>
        
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da notificação"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-2">
              Destinatários
            </label>
            <select
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value as 'all' | 'customers' | 'workshops')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent"
            >
              <option value="all">Todos os usuários</option>
              <option value="customers">Apenas clientes</option>
              <option value="workshops">Apenas oficinas</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00c977] hover:bg-[#00b369] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Notificações</h2>
        
        <div className="text-center py-8">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação enviada</h3>
          <p className="text-gray-500">As notificações enviadas aparecerão aqui.</p>
        </div>
      </div>
    </div>
  )
}