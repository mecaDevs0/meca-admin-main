'use client'

import Logo from '@/components/ui/Logo'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, KeyRound, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

  const handleSendCode = async () => {
    if (!email) {
      showToast.error('Email obrigatório', 'Digite seu email para receber o código')
      return
    }
    setSendingCode(true)
    setError('')
    try {
      const { data, error: apiError } = await apiClient.sendLoginCode(email)
      if (data?.success) {
        setCodeSent(true)
        showToast.success('Código enviado!', 'Verifique seu email')
      } else {
        showToast.error('Erro ao enviar código', apiError || 'Não foi possível enviar o código')
        setError(apiError || 'Erro ao enviar código')
      }
    } catch {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setError('Erro de conexão')
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
      const { data, error: apiError } = await apiClient.loginWithCode(email, code)
      if (data?.success && data.data?.token) {
        localStorage.setItem('meca_admin_token', data.data.token)
        showToast.success('Login realizado!', 'Redirecionando...')
        setTimeout(() => router.push('/dashboard'), 500)
      } else {
        showToast.error('Código inválido', apiError || 'Código incorreto ou expirado')
        setError(apiError || 'Código inválido ou expirado')
      }
    } catch {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setError('Erro de conexão')
    }
    setLoading(false)
  }

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: apiError } = await apiClient.login(email, password)
      if (data?.success && data.data?.token) {
        localStorage.setItem('meca_admin_token', data.data.token)
        showToast.success('Login realizado!', 'Redirecionando...')
        setTimeout(() => router.push('/dashboard'), 500)
      } else if (data?.requires_setup) {
        showToast.warning('Senha não configurada', 'Verifique seu email para criar sua senha')
        setError('Sua senha ainda não foi configurada. Verifique seu email.')
      } else {
        showToast.error('Credenciais inválidas', apiError || 'Email ou senha incorretos')
        setError(apiError || 'Credenciais inválidas')
      }
    } catch {
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setError('Erro de conexão')
    }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'code' && !codeSent) {
      e.preventDefault()
      handleSendCode()
      return
    }
    mode === 'password' ? handleLoginWithPassword(e) : handleLoginWithCode(e)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#0A0A0F' }}
    >
      {/* Subtle radial glow behind form */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(0,201,119,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[400px]"
      >
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <Logo variant="icon" color="green" size="lg" />
          </motion.div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            MECA Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Faça login para acessar o painel
          </p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-7 sm:p-8"
          style={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Mode toggle */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(['password', 'code'] as LoginMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setCodeSent(false); setError(''); }}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === m ? 'rgba(0,201,119,0.12)' : 'transparent',
                  color: mode === m ? '#00C977' : '#6B7280',
                  border: mode === m ? '1px solid rgba(0,201,119,0.20)' : '1px solid transparent',
                }}
              >
                {m === 'password' ? 'Senha' : 'Código'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email — shared between modes */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#4B5563' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={mode === 'code' && codeSent}
                  placeholder="admin@mecabr.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-500"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F3F4F6',
                    WebkitTextFillColor: '#F3F4F6',
                    caretColor: '#F3F4F6',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(0,201,119,0.40)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>
            </div>

            {/* Password mode fields */}
            <AnimatePresence mode="wait">
              {mode === 'password' && (
                <motion.div
                  key="pw"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                      Senha
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: '#4B5563' }}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-500"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#F3F4F6',
                          WebkitTextFillColor: '#F3F4F6',
                          caretColor: '#F3F4F6',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(0,201,119,0.40)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code mode fields */}
            <AnimatePresence mode="wait">
              {mode === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {!codeSent ? (
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={sendingCode || !email}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: '#252940',
                        color: '#E5E7EB',
                        border: '1px solid rgba(255,255,255,0.08)',
                        cursor: sendingCode || !email ? 'not-allowed' : 'pointer',
                        opacity: sendingCode || !email ? 0.5 : 1,
                      }}
                    >
                      {sendingCode ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <KeyRound size={16} />
                      )}
                      {sendingCode ? 'Enviando...' : 'Enviar código para email'}
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                        Código de 6 dígitos
                      </label>
                      <div className="relative">
                        <KeyRound
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: '#4B5563' }}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          required
                          maxLength={6}
                          autoFocus
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono outline-none transition-all duration-200 placeholder:text-gray-500"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#F3F4F6',
                            WebkitTextFillColor: '#F3F4F6',
                            caretColor: '#F3F4F6',
                            textAlign: 'center',
                            fontSize: 18,
                            letterSpacing: '0.3em',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'rgba(0,201,119,0.40)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[11px]" style={{ color: '#6B7280' }}>
                          Verifique seu email
                        </p>
                        <button
                          type="button"
                          onClick={() => { setCode(''); handleSendCode(); }}
                          className="text-[11px] font-medium"
                          style={{ color: '#00C977', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          Reenviar código
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="px-4 py-3 rounded-xl text-xs font-medium"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.20)',
                    color: '#F87171',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            {(mode === 'password' || (mode === 'code' && codeSent)) && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || (mode === 'code' && code.length !== 6)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: '#00C977',
                  color: '#0A0A0F',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading || (mode === 'code' && code.length !== 6) ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'password' ? 'Entrar' : 'Verificar código'}
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] mt-6" style={{ color: '#4B5563' }}>
          Acesso restrito a administradores MECA
        </p>
      </motion.div>
    </div>
  )
}
