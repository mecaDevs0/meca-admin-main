'use client'

import Pagination from '@/components/ui/Pagination'
import UserDetailModal from '@/components/users/UserDetailModal'
import { showToast } from '@/lib/toast'
import { apiClient } from '@/lib/api'
import { exportCsv, csvFilename } from '@/lib/csv'
import { formatPhone } from '@/lib/utils'
import { Calendar, Download, Mail, Phone, Search, Users } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  type: 'customer' | 'workshop'
  created_at: string
  acquisition_source?: string | null
}

const SOURCE_BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  organic: { label: 'Orgânico', color: '#00C977' },
  'Meta Ads': { label: 'Meta', color: '#1877F2' },
  restricted: { label: 'Meta', color: '#1877F2' },
  tiktokads: { label: 'TikTok', color: '#010101' },
  googleadwords_int: { label: 'Google', color: '#FBBC04' },
}

function AcquisitionBadge({ source }: { source?: string | null }) {
  if (!source) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        —
      </span>
    )
  }
  const cfg = SOURCE_BADGE_CONFIG[source] || { label: source, color: '#6B7280' }
  const isLight = source === 'googleadwords_int'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        backgroundColor: `${cfg.color}18`,
        color: isLight ? '#92400E' : cfg.color,
        border: `1px solid ${cfg.color}30`,
      }}
    >
      {cfg.label}
    </span>
  )
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersPageInner />
    </Suspense>
  )
}

function UsersPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const PAGE_SIZE = 20
  const [users, setUsers] = useState<User[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value)
      handlePageChange(1)
    }, 300)
  }, [])
  const [filter, setFilter] = useState<'all' | 'customer' | 'workshop'>('all')
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page')
    return p ? Math.max(1, parseInt(p, 10) || 1) : 1
  })
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handlePageChange = (p: number) => {
    setPage(p)
    const params = new URLSearchParams(window.location.search)
    if (p > 1) params.set('page', String(p)); else params.delete('page')
    router.replace(`?${params}`, { scroll: false })
  }

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadUsers()
  }, [filter, router])

  const loadUsers = async () => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('meca_admin_token')
      if (!token) {
        router.push('/login')
        return
      }
      apiClient.setToken(token)
      
      const type = filter === 'all' ? undefined : filter
      const { data, error } = await apiClient.getUsers(type)
      
      if (error || !data) {
        showToast.error('Erro ao carregar usuários', error || 'Não foi possível carregar os dados')
        setUsers([])
        setLoading(false)
        return
      }
      
      // A API retorna { success: true, customers: [...] } ou { success: true, data: { customers: [...] } }
      const d = data as {
        customers?: unknown[]
        data?: { customers?: unknown[] } | unknown[]
      }
      const usersData =
        d.customers ??
        (Array.isArray(d.data) ? d.data : d.data?.customers) ??
        []
      
      // Mapear dados da API para o formato esperado
      const mappedUsers = usersData.map((user: any) => ({
        id: user.id,
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`.trim()
          : user.first_name || user.last_name || user.name || user.full_name || 'Sem nome',
        email: user.email || 'Não informado',
        phone: user.phone || 'Não informado',
        type: user.type || 'customer',
        created_at: user.created_at || new Date().toISOString(),
        acquisition_source: user.acquisition_source || null,
      }))
      
      setUsers(mappedUsers)
    } catch {
      showToast.error('Erro', 'Ocorreu um erro ao carregar os usuários')
      setUsers([])
    }

    setLoading(false)
  }

  const normalize = (text: string) =>
    (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9@.]/g, '')

  const filteredUsers = users.filter(user => {
    if (!search.trim()) return true
    const q = normalize(search)
    return (
      normalize(user.name).includes(q) ||
      normalize(user.email).includes(q) ||
      (user.phone && user.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')))
    )
  })
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Usuários</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie clientes e proprietários de oficinas</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                aria-label="Buscar usuários"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00c977] focus:border-transparent dark:bg-gray-900/50 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => exportCsv(csvFilename('usuarios'), [
                { header: 'Nome', accessor: (u: User) => u.name },
                { header: 'Email', accessor: (u: User) => u.email },
                { header: 'Telefone', accessor: (u: User) => formatPhone(u.phone) },
                { header: 'Tipo', accessor: (u: User) => u.type === 'customer' ? 'Cliente' : 'Oficina' },
                { header: 'Cadastro', accessor: (u: User) => new Date(u.created_at).toLocaleDateString('pt-BR') },
              ], filteredUsers)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('customer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'customer' 
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setFilter('workshop')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'workshop' 
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Oficinas
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00c977] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg p-8 text-center">
              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Não há usuários com os filtros selecionados.</p>
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedUser(user);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes de ${user.name}`}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl p-4 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.type === 'customer' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Users className={`w-5 h-5 ${
                        user.type === 'customer' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{formatPhone(user.phone)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AcquisitionBadge source={user.acquisition_source} />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.type === 'customer'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {user.type === 'customer' ? 'Cliente' : 'Oficina'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Pagination currentPage={page} totalItems={filteredUsers.length} pageSize={PAGE_SIZE} onPageChange={handlePageChange} />

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
      </div>
    </div>
  )
}
