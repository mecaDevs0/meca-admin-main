'use client'

import Logo from '@/components/ui/Logo'
import { showToast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type LoginMode = 'password' | 'code'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (token) {
        router.replace('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao verificar token salvo:', error)
    }
  }, [router])

  const handleSendCode = async () => {
    if (!email) {
      showToast.error('Email obrigatório', 'Digite seu email para receber o código')
      return
    }

    setSendingCode(true)
    setError('')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'
      
      const response = await fetch(`${API_URL}/admin/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setCodeSent(true)
        showToast.success('Código enviado!', 'Verifique seu email para receber o código de acesso')
      } else {
        showToast.error('Erro ao enviar código', result.error || 'Não foi possível enviar o código')
        setError(result.error || 'Erro ao enviar código')
      }
    } catch (error) {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setError('Erro de conexão. Verifique se a API está rodando.')
      console.error('Erro:', error)
    }

    setSendingCode(false)
  }

  const handleLoginWithCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!code || code.length !== 6) {
      showToast.error('Código inválido', 'O código deve ter 6 dígitos')
      setLoading(false)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'
      
      const response = await fetch(`${API_URL}/admin/auth/login-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (result.data?.token) {
          localStorage.setItem('meca_admin_token', result.data.token)
          showToast.success('Login realizado!', 'Redirecionando...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 500)
        } else {
          showToast.error('Token não recebido', 'Tente novamente')
          setError('Token não recebido. Tente novamente.')
        }
      } else {
        showToast.error('Código inválido', result.error || 'O código informado está incorreto ou expirado')
        setError(result.error || 'Código inválido ou expirado')
      }
    } catch (error) {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setError('Erro de conexão. Verifique se a API está rodando.')
      console.error('Erro:', error)
    }
    
    setLoading(false)
  }

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000'
      
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (result.data?.token) {
          localStorage.setItem('meca_admin_token', result.data.token)
          showToast.success('Login realizado!', 'Redirecionando...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 500)
        } else {
          showToast.error('Token não recebido', 'Tente novamente')
          setError('Token não recebido. Tente novamente.')
        }
      } else {
        if (result.requires_setup) {
          showToast.warning('Senha não configurada', 'Verifique seu email para criar sua senha')
          setError('Sua senha ainda não foi configurada. Verifique seu email para criar sua senha.')
        } else {
          showToast.error('Credenciais inválidas', result.error || 'Email ou senha incorretos')
          setError(result.error || 'Credenciais inválidas')
        }
      }
    } catch (error) {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setError('Erro de conexão. Verifique se a API está rodando.')
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

  return (
    <div className="min-h-screen flex">
      {/* Left side - Clean gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#252940] via-[#1B1D2E] to-[#252940] items-center justify-center p-12 relative">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div 
            variants={itemVariants}
            className="mb-12 flex justify-center"
          >
            <Logo variant="full" color="white" size="xl" animated />
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed"
          >
            Gerencie oficinas, serviços e monitore o marketplace automotivo com inteligência e eficiência
          </motion.p>
        </motion.div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Logo for small screens */}
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
              <h2 className="text-3xl font-bold text-[#252940] mb-2">Bem-vindo!</h2>
              <p className="text-gray-600">Faça login para acessar o painel</p>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div 
              variants={itemVariants}
              className="mb-6 flex gap-2 bg-gray-100 rounded-2xl p-1"
            >
              <button
                onClick={() => {
                  setMode('password')
                  setCodeSent(false)
                  setError('')
                }}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 ${
                  mode === 'password'
                    ? 'bg-white text-[#00c977] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Senha
              </button>
              <button
                onClick={() => {
                  setMode('code')
                  setError('')
                }}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 ${
                  mode === 'code'
                    ? 'bg-white text-[#00c977] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Código
              </button>
            </motion.div>

            {/* Password Login Form */}
            <AnimatePresence mode="wait">
              {mode === 'password' && (
                <motion.form 
                  key="password-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLoginWithPassword} 
                  className="space-y-6"
                >
                {/* Email Input */}
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="admin@meca.com"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      required
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

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
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
                      Entrar
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Code Login Form */}
            <AnimatePresence mode="wait">
              {mode === 'code' && (
              <motion.form 
                key="code-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLoginWithCode} 
                className="space-y-6"
              >
                {/* Email Input */}
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="admin@meca.com"
                      required
                      disabled={codeSent}
                    />
                  </div>
                </motion.div>

                {/* Send Code Button */}
                {!codeSent && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || !email}
                    className="w-full bg-gradient-to-r from-[#252940] to-[#1B1D2E] hover:from-[#1B1D2E] hover:to-[#252940] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#252940]/25 hover:shadow-xl hover:shadow-[#252940]/40 flex items-center justify-center gap-3"
                  >
                    {sendingCode ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Enviar Código
                        <KeyRound className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                )}

                {/* Code Input */}
                {codeSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Código de Acesso (6 dígitos)
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setCode(value)
                        }}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00c977]/20 focus:border-[#00c977] outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-center text-2xl font-bold tracking-widest"
                        placeholder="000000"
                        required
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Verifique seu email para o código de acesso
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeSent(false)
                        setCode('')
                        handleSendCode()
                      }}
                      className="text-sm text-[#00c977] hover:text-[#00b369] font-medium mt-2 w-full text-center"
                    >
                      Reenviar código
                    </button>
                  </motion.div>
                )}

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

                {/* Login Button */}
                {codeSent && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || code.length !== 6}
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
                        Entrar com Código
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                )}
              </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
