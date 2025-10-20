'use client'

import Logo from '@/components/ui/Logo'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (email === 'admin@meca.com' && password === 'admin123') {
      localStorage.setItem('meca_admin_token', 'mock-admin-token')
      router.push('/dashboard')
    } else {
      setError('Credenciais inválidas. Tente: admin@meca.com / admin123')
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
        <div className="text-center">
          <div className="mb-8">
            <Logo variant="full" color="white" size="xl" />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            MECA
          </h1>
          
          <p className="text-2xl text-gray-300 mb-2 font-light">
            Admin Dashboard
          </p>
          
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Gerencie oficinas, serviços e monitore o marketplace automotivo com inteligência e eficiência
          </p>
        </div>
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

            <motion.form 
              variants={itemVariants}
              onSubmit={handleLogin} 
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

            <motion.div 
              variants={itemVariants}
              className="mt-8 p-4 bg-gray-50 rounded-2xl"
            >
              <p className="text-xs text-center text-gray-500 font-medium">
                <span className="font-bold">Credenciais de teste:</span><br />
                <span className="text-[#00c977] font-semibold">admin@meca.com</span> / 
                <span className="text-[#00c977] font-semibold"> admin123</span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}