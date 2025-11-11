'use client'

import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Send, Users, Building2, CheckCircle2, X, Search, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface Workshop {
  id: string
  name: string
  email: string
}

type NotificationTarget = 'all' | 'customers' | 'workshops' | 'specific'

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<NotificationTarget>('all')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([])
  const [searchCustomers, setSearchCustomers] = useState('')
  const [searchWorkshops, setSearchWorkshops] = useState('')

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
      const [customersRes, workshopsRes] = await Promise.all([
        apiClient.getCustomers({ limit: 1000 }),
        apiClient.getWorkshops(),
      ])

      if (customersRes.data) {
        const customersData = Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.data || []
        setCustomers(customersData as Customer[])
      }

      if (workshopsRes.data) {
        const workshopsData = Array.isArray(workshopsRes.data) ? workshopsRes.data : workshopsRes.data.data || []
        setWorkshops(workshopsData as Workshop[])
      }
    } catch (error) {
      showToast.error('Erro ao carregar dados', 'Não foi possível carregar usuários e oficinas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showToast.error('Campos obrigatórios', 'Preencha o título e a mensagem')
      return
    }

    if (target === 'specific' && selectedCustomers.length === 0 && selectedWorkshops.length === 0) {
      showToast.error('Selecione destinatários', 'Escolha pelo menos um cliente ou oficina')
      return
    }

    setSending(true)

    try {
      const payload: any = {
        title: title.trim(),
        message: message.trim(),
        target,
      }

      if (target === 'specific') {
        if (selectedCustomers.length > 0) {
          payload.customer_ids = selectedCustomers
        }
        if (selectedWorkshops.length > 0) {
          payload.workshop_ids = selectedWorkshops
        }
      }

      const { data, error } = await apiClient.sendNotification(payload)

      if (error || !data) {
        showToast.error('Erro ao enviar', error || 'Não foi possível enviar a notificação')
        return
      }

      showToast.success('Notificação enviada!', 'A notificação foi enviada com sucesso')
      
      // Reset form
        setTitle('')
        setMessage('')
      setTarget('all')
      setSelectedCustomers([])
      setSelectedWorkshops([])
    } catch (error) {
      showToast.error('Erro', 'Ocorreu um erro ao enviar a notificação')
      console.error('Erro:', error)
    } finally {
      setSending(false)
    }
  }

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const toggleWorkshop = (workshopId: string) => {
    setSelectedWorkshops(prev =>
      prev.includes(workshopId)
        ? prev.filter(id => id !== workshopId)
        : [...prev, workshopId]
    )
  }

  const filteredCustomers = customers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchCustomers.toLowerCase()) ||
    c.email.toLowerCase().includes(searchCustomers.toLowerCase())
  )

  const filteredWorkshops = workshops.filter(w =>
    w.name.toLowerCase().includes(searchWorkshops.toLowerCase()) ||
    w.email.toLowerCase().includes(searchWorkshops.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-full mx-auto"
      >
      {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Enviar Notificações</h1>
              <p className="text-gray-600 dark:text-gray-400">Envie notificações para usuários ou grupos específicos</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Destinatários</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Todos', icon: Users },
                    { value: 'customers', label: 'Clientes', icon: UserPlus },
                    { value: 'workshops', label: 'Oficinas', icon: Building2 },
                    { value: 'specific', label: 'Específicos', icon: CheckCircle2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setTarget(value as NotificationTarget)
                        if (value !== 'specific') {
                          setSelectedCustomers([])
                          setSelectedWorkshops([])
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        target === value
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20 text-[#00c977] dark:text-[#00c977]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
        </div>
      </div>

              {/* Title */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
            />
          </div>

              {/* Message */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mensagem *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all resize-none dark:bg-gray-900/50 dark:text-white"
            />
          </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-bold rounded-xl shadow-lg shadow-[#00c977]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Notificação
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Selection Panel */}
          {target === 'specific' && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Customers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Clientes ({selectedCustomers.length} selecionados)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchCustomers}
                    onChange={(e) => setSearchCustomers(e.target.value)}
                    placeholder="Buscar clientes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => toggleCustomer(customer.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCustomers.includes(customer.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workshops */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Oficinas ({selectedWorkshops.length} selecionadas)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchWorkshops}
                    onChange={(e) => setSearchWorkshops(e.target.value)}
                    placeholder="Buscar oficinas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredWorkshops.map((workshop) => (
                    <button
                      key={workshop.id}
                      onClick={() => toggleWorkshop(workshop.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedWorkshops.includes(workshop.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{workshop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{workshop.email}</p>
                        </div>
                        {selectedWorkshops.includes(workshop.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-full mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Enviar Notificações</h1>
              <p className="text-gray-600 dark:text-gray-400">Envie notificações para usuários ou grupos específicos</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Destinatários</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Todos', icon: Users },
                    { value: 'customers', label: 'Clientes', icon: UserPlus },
                    { value: 'workshops', label: 'Oficinas', icon: Building2 },
                    { value: 'specific', label: 'Específicos', icon: CheckCircle2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setTarget(value as NotificationTarget)
                        if (value !== 'specific') {
                          setSelectedCustomers([])
                          setSelectedWorkshops([])
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        target === value
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20 text-[#00c977] dark:text-[#00c977]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Message */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mensagem *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all resize-none dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-bold rounded-xl shadow-lg shadow-[#00c977]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Notificação
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Selection Panel */}
          {target === 'specific' && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Customers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Clientes ({selectedCustomers.length} selecionados)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchCustomers}
                    onChange={(e) => setSearchCustomers(e.target.value)}
                    placeholder="Buscar clientes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => toggleCustomer(customer.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCustomers.includes(customer.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workshops */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Oficinas ({selectedWorkshops.length} selecionadas)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchWorkshops}
                    onChange={(e) => setSearchWorkshops(e.target.value)}
                    placeholder="Buscar oficinas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredWorkshops.map((workshop) => (
                    <button
                      key={workshop.id}
                      onClick={() => toggleWorkshop(workshop.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedWorkshops.includes(workshop.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{workshop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{workshop.email}</p>
                        </div>
                        {selectedWorkshops.includes(workshop.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-full mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Enviar Notificações</h1>
              <p className="text-gray-600 dark:text-gray-400">Envie notificações para usuários ou grupos específicos</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Destinatários</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Todos', icon: Users },
                    { value: 'customers', label: 'Clientes', icon: UserPlus },
                    { value: 'workshops', label: 'Oficinas', icon: Building2 },
                    { value: 'specific', label: 'Específicos', icon: CheckCircle2 },
                  ].map(({ value, label, icon: Icon }) => (
            <button
                      key={value}
                      onClick={() => {
                        setTarget(value as NotificationTarget)
                        if (value !== 'specific') {
                          setSelectedCustomers([])
                          setSelectedWorkshops([])
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        target === value
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20 text-[#00c977] dark:text-[#00c977]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mensagem *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all resize-none dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-bold rounded-xl shadow-lg shadow-[#00c977]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Notificação
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Selection Panel */}
          {target === 'specific' && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Customers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Clientes ({selectedCustomers.length} selecionados)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchCustomers}
                    onChange={(e) => setSearchCustomers(e.target.value)}
                    placeholder="Buscar clientes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => toggleCustomer(customer.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCustomers.includes(customer.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workshops */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Oficinas ({selectedWorkshops.length} selecionadas)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchWorkshops}
                    onChange={(e) => setSearchWorkshops(e.target.value)}
                    placeholder="Buscar oficinas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredWorkshops.map((workshop) => (
                    <button
                      key={workshop.id}
                      onClick={() => toggleWorkshop(workshop.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedWorkshops.includes(workshop.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{workshop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{workshop.email}</p>
                        </div>
                        {selectedWorkshops.includes(workshop.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
            </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-full mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Enviar Notificações</h1>
              <p className="text-gray-600 dark:text-gray-400">Envie notificações para usuários ou grupos específicos</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Destinatários</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Todos', icon: Users },
                    { value: 'customers', label: 'Clientes', icon: UserPlus },
                    { value: 'workshops', label: 'Oficinas', icon: Building2 },
                    { value: 'specific', label: 'Específicos', icon: CheckCircle2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setTarget(value as NotificationTarget)
                        if (value !== 'specific') {
                          setSelectedCustomers([])
                          setSelectedWorkshops([])
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        target === value
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20 text-[#00c977] dark:text-[#00c977]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mensagem *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all resize-none dark:bg-gray-900/50 dark:text-white"
                />
      </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-bold rounded-xl shadow-lg shadow-[#00c977]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Notificação
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Selection Panel */}
          {target === 'specific' && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Customers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Clientes ({selectedCustomers.length} selecionados)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchCustomers}
                    onChange={(e) => setSearchCustomers(e.target.value)}
                    placeholder="Buscar clientes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => toggleCustomer(customer.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCustomers.includes(customer.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workshops */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Oficinas ({selectedWorkshops.length} selecionadas)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchWorkshops}
                    onChange={(e) => setSearchWorkshops(e.target.value)}
                    placeholder="Buscar oficinas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredWorkshops.map((workshop) => (
                    <button
                      key={workshop.id}
                      onClick={() => toggleWorkshop(workshop.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedWorkshops.includes(workshop.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{workshop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{workshop.email}</p>
                        </div>
                        {selectedWorkshops.includes(workshop.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-full mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Enviar Notificações</h1>
              <p className="text-gray-600 dark:text-gray-400">Envie notificações para usuários ou grupos específicos</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Destinatários</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Todos', icon: Users },
                    { value: 'customers', label: 'Clientes', icon: UserPlus },
                    { value: 'workshops', label: 'Oficinas', icon: Building2 },
                    { value: 'specific', label: 'Específicos', icon: CheckCircle2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setTarget(value as NotificationTarget)
                        if (value !== 'specific') {
                          setSelectedCustomers([])
                          setSelectedWorkshops([])
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        target === value
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20 text-[#00c977] dark:text-[#00c977]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mensagem *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all resize-none dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-bold rounded-xl shadow-lg shadow-[#00c977]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Notificação
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Selection Panel */}
          {target === 'specific' && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Customers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Clientes ({selectedCustomers.length} selecionados)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchCustomers}
                    onChange={(e) => setSearchCustomers(e.target.value)}
                    placeholder="Buscar clientes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => toggleCustomer(customer.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCustomers.includes(customer.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workshops */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252940] dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Oficinas ({selectedWorkshops.length} selecionadas)
                  </h3>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchWorkshops}
                    onChange={(e) => setSearchWorkshops(e.target.value)}
                    placeholder="Buscar oficinas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredWorkshops.map((workshop) => (
                    <button
                      key={workshop.id}
                      onClick={() => toggleWorkshop(workshop.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedWorkshops.includes(workshop.id)
                          ? 'border-[#00c977] bg-[#00c977]/10 dark:bg-[#00c977]/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{workshop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{workshop.email}</p>
                        </div>
                        {selectedWorkshops.includes(workshop.id) && (
                          <CheckCircle2 className="w-5 h-5 text-[#00c977]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
      </div>
      </motion.div>
    </div>
  )
}
