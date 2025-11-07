'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { User, Mail, Lock, Save, LogOut, Shield, Calendar, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AdminProfile {
  email: string
  name?: string
  role?: string
  created_at?: string
  last_login?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    name: ''
  })
  const [creatingAdmin, setCreatingAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadProfile()
  }, [router])

  const loadProfile = async () => {
    setLoading(true)
    try {
      // Buscar email do token (pode ser decodificado do JWT)
      const token = localStorage.getItem('meca_admin_token')
      if (token) {
        // Decodificar token para pegar email
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          setProfile({
            email: payload.email || 'admin@meca.com.br',
            name: payload.name || 'Administrador MECA',
            role: 'Administrador',
            created_at: payload.created_at || new Date().toISOString(),
            last_login: new Date().toISOString()
          })
        } catch {
          setProfile({
            email: 'admin@meca.com.br',
            name: 'Administrador MECA',
            role: 'Administrador',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      showToast.error('Erro', 'Ocorreu um erro ao carregar o perfil')
    }
    setLoading(false)
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      showToast.error('Senha atual obrigatória', 'Por favor, informe sua senha atual')
      return
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      showToast.error('Senha inválida', 'A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('Senhas não conferem', 'As senhas devem ser iguais')
      return
    }

    setSaving(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'
      const token = localStorage.getItem('meca_admin_token')

      const response = await fetch(`${API_URL}/admin/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast.success('Senha alterada!', 'Sua senha foi alterada com sucesso')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showToast.error('Erro', data.error || 'Não foi possível alterar a senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
    }
    setSaving(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('meca_admin_token')
    showToast.success('Logout realizado', 'Você foi desconectado com sucesso')
    router.push('/login')
  }

  const handleCreateAdmin = async () => {
    if (!newAdminData.email) {
      showToast.error('Email obrigatório', 'Por favor, informe o email do novo admin')
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newAdminData.email)) {
      showToast.error('Email inválido', 'Por favor, informe um email válido')
      return
    }

    setCreatingAdmin(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'}/admin/auth/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('meca_admin_token')}`
        },
        body: JSON.stringify({
          email: newAdminData.email,
          name: newAdminData.name || newAdminData.email.split('@')[0]
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast.success('Admin criado!', 'As credenciais foram enviadas por email')
        setNewAdminData({ email: '', name: '' })
      } else {
        showToast.error('Erro ao criar admin', data.error || 'Não foi possível criar o admin')
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
    }
    setCreatingAdmin(false)
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
    return <Loading message="Carregando perfil..." size={200} />
  }

  if (!profile) {
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informações da sua conta administrativa</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Função
              </label>
              <input
                type="text"
                value={profile.role || 'Administrador'}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configurações de Segurança
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Create New Admin */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Admin
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email do Novo Admin
              </label>
              <input
                type="email"
                placeholder="exemplo@mecabr.com"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome do administrador"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se não informado, será usado o nome antes do @ do email</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAdmin}
              disabled={creatingAdmin || !newAdminData.email}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {creatingAdmin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Admin e Enviar Credenciais
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Ações</h2>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg justify-center"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('meca_admin_token')}`
        },
        body: JSON.stringify({
          email: newAdminData.email,
          name: newAdminData.name || newAdminData.email.split('@')[0]
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast.success('Admin criado!', 'As credenciais foram enviadas por email')
        setNewAdminData({ email: '', name: '' })
      } else {
        showToast.error('Erro ao criar admin', data.error || 'Não foi possível criar o admin')
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
    }
    setCreatingAdmin(false)
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
    return <Loading message="Carregando perfil..." size={200} />
  }

  if (!profile) {
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informações da sua conta administrativa</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Função
              </label>
              <input
                type="text"
                value={profile.role || 'Administrador'}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configurações de Segurança
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Create New Admin */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Admin
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email do Novo Admin
              </label>
              <input
                type="email"
                placeholder="exemplo@mecabr.com"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome do administrador"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se não informado, será usado o nome antes do @ do email</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAdmin}
              disabled={creatingAdmin || !newAdminData.email}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {creatingAdmin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Admin e Enviar Credenciais
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Ações</h2>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg justify-center"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('meca_admin_token')}`
        },
        body: JSON.stringify({
          email: newAdminData.email,
          name: newAdminData.name || newAdminData.email.split('@')[0]
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast.success('Admin criado!', 'As credenciais foram enviadas por email')
        setNewAdminData({ email: '', name: '' })
      } else {
        showToast.error('Erro ao criar admin', data.error || 'Não foi possível criar o admin')
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
    }
    setCreatingAdmin(false)
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
    return <Loading message="Carregando perfil..." size={200} />
  }

  if (!profile) {
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informações da sua conta administrativa</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Função
              </label>
              <input
                type="text"
                value={profile.role || 'Administrador'}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configurações de Segurança
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Create New Admin */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Admin
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email do Novo Admin
              </label>
              <input
                type="email"
                placeholder="exemplo@mecabr.com"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome do administrador"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se não informado, será usado o nome antes do @ do email</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAdmin}
              disabled={creatingAdmin || !newAdminData.email}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {creatingAdmin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Admin e Enviar Credenciais
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Ações</h2>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg justify-center"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('meca_admin_token')}`
        },
        body: JSON.stringify({
          email: newAdminData.email,
          name: newAdminData.name || newAdminData.email.split('@')[0]
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast.success('Admin criado!', 'As credenciais foram enviadas por email')
        setNewAdminData({ email: '', name: '' })
      } else {
        showToast.error('Erro ao criar admin', data.error || 'Não foi possível criar o admin')
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
    }
    setCreatingAdmin(false)
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
    return <Loading message="Carregando perfil..." size={200} />
  }

  if (!profile) {
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informações da sua conta administrativa</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Função
              </label>
              <input
                type="text"
                value={profile.role || 'Administrador'}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configurações de Segurança
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Create New Admin */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Admin
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email do Novo Admin
              </label>
              <input
                type="email"
                placeholder="exemplo@mecabr.com"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome do administrador"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se não informado, será usado o nome antes do @ do email</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAdmin}
              disabled={creatingAdmin || !newAdminData.email}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {creatingAdmin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Admin e Enviar Credenciais
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Ações</h2>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg justify-center"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('meca_admin_token')}`
        },
        body: JSON.stringify({
          email: newAdminData.email,
          name: newAdminData.name || newAdminData.email.split('@')[0]
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast.success('Admin criado!', 'As credenciais foram enviadas por email')
        setNewAdminData({ email: '', name: '' })
      } else {
        showToast.error('Erro ao criar admin', data.error || 'Não foi possível criar o admin')
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
    }
    setCreatingAdmin(false)
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
    return <Loading message="Carregando perfil..." size={200} />
  }

  if (!profile) {
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informações da sua conta administrativa</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#252940] dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Função
              </label>
              <input
                type="text"
                value={profile.role || 'Administrador'}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
              />
            </div>

          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configurações de Segurança
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Create New Admin */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Admin
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email do Novo Admin
              </label>
              <input
                type="email"
                placeholder="exemplo@mecabr.com"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome do administrador"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all dark:bg-gray-900/50 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se não informado, será usado o nome antes do @ do email</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAdmin}
              disabled={creatingAdmin || !newAdminData.email}
              className="bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg w-full justify-center"
            >
              {creatingAdmin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Admin e Enviar Credenciais
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-[#252940] dark:text-white mb-4">Ações</h2>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg justify-center"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
