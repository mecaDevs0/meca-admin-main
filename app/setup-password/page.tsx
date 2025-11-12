'use client'

import Logo from '@/components/ui/Logo'
import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, KeyRound } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <SetupPasswordContent />
    </Suspense>
  )
}

function SetupPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      showToast.error('Token inválido', 'Verifique o link do email')
      setError('Token inválido. Verifique o link do email.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!token) {
      showToast.error('Token inválido', 'Verifique o link do email')
      setError('Token inválido')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      showToast.error('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres')
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      showToast.error('Senhas não coincidem', 'As senhas devem ser idênticas')
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const { data, error: apiError } = await apiClient.setupPassword(token, password)

      if (apiError || !data) {
        showToast.error('Erro ao configurar senha', apiError || 'Verifique o token e tente novamente')
        setError(apiError || 'Erro ao configurar senha. Verifique o token.')
      } else {
        showToast.success('Senha configurada!', 'Redirecionando para o login...')
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      showToast.error('Erro de conexão', 'Tente novamente')
      setError('Erro de conexão. Tente novamente.')
      console.error('Erro:', error)
    }

    setLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#252940] mb-2">Senha Configurada!</h2>
          <p className="text-gray-600 mb-4">Sua senha foi configurada com sucesso.</p>
          <p className="text-sm text-gray-500">Redirecionando para o login...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#252940] via-[#1B1D2E] to-[#252940] items-center justify-center p-12 relative">
        <div className="text-center">
          <div className="mb-8">
            <Logo variant="full" color="white" size="xl" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">MECA</h1>
          <p className="text-2xl text-gray-300 mb-2 font-light">Admin Dashboard</p>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Configure sua senha para acessar o painel administrativo
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div 
            variants={itemVariants}
            className="lg:hidden text-center mb-8"
          >
            <Logo variant="full" color="green" size="lg" animated />
            <h1 className="text-3xl font-bold text-[#252940] mt-4">MECA Admin</h1>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-8 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#252940] mb-2">Configurar Senha</h2>
              <p className="text-gray-600">Defina uma senha para sua conta administrativa</p>
            </motion.div>

            <motion.form 
              variants={itemVariants}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Password Input */}
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="Confirme sua senha"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#00c977]/25 hover:shadow-xl hover:shadow-[#00c977]/40 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Configurar Senha
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

