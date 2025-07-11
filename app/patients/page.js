'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { UserCheck, Plus } from 'lucide-react'
import AddPatientSidebar from '../../components/AddPatientSidebar'
import Button from '../../components/Button'

export default function Patients() {
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all')
  const [showAddSidebar, setShowAddSidebar] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        fetchPatients(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  const fetchPatients = async (psychologistId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching patients:', error)
      } else {
        setPatients(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
    
    setLoading(false)
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`
    } else {
      return `${baseClasses} bg-red-100 text-red-800`
    }
  }

  const getSessionTypeBadge = (sessionType) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (sessionType) {
      case 'remote':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'on-site':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'hybrid':
        return `${baseClasses} bg-orange-100 text-orange-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatSpecialty = (specialty) => {
    if (!specialty) return 'Não especificado'
    
    const specialtyMap = {
      'clinical': 'Psicologia Clínica',
      'counseling': 'Psicologia de Aconselhamento',
      'cognitive': 'Psicologia Cognitiva',
      'behavioral': 'Psicologia Comportamental',
      'developmental': 'Psicologia do Desenvolvimento',
      'forensic': 'Psicologia Forense',
      'health': 'Psicologia da Saúde',
      'neuropsychology': 'Neuropsicologia',
      'school': 'Psicologia Escolar',
      'social': 'Psicologia Social',
      'sport': 'Psicologia do Desporto',
      'trauma': 'Psicologia do Trauma',
      'addiction': 'Psicologia das Adições',
      'family': 'Terapia Familiar',
      'couples': 'Terapia de Casal',
      'group': 'Terapia de Grupo',
      'other': 'Outro'
    }
    
    return specialtyMap[specialty] || specialty
  }

  // Ordenar pacientes alfabeticamente por nome
  const sortedPatients = [...patients].sort((a, b) => {
    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Filter patients based on search term and filter dropdowns
  const filteredPatients = sortedPatients.filter(patient => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      
      const matchesSearch = fullName.includes(searchLower) || 
                           email.includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && patient.status !== statusFilter) {
      return false;
    }
    
    // Session type filter
    if (sessionTypeFilter !== 'all' && patient.session_type !== sessionTypeFilter) {
      return false;
    }
    
    return true;
  });

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || sessionTypeFilter !== 'all'

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <UserCheck className="w-4 h-4 mr-1" />
                {patients.filter(p => p.status === 'active').length} Pacientes Ativos
              </span>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddSidebar(true)}
            className="inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Novo Paciente
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">Search patients</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Pesquisar pacientes por nome, email ou especialidade..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">Todos os Estados</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Session Type Filter */}
          <div className="min-w-[140px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">Todos os Tipos de Sessão</option>
                <option value="on-site">Presencial</option>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setSessionTypeFilter('all')
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        patients.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ainda não há pacientes</h3>
            <p className="text-gray-600 mb-6">Comece por adicionar o seu primeiro paciente</p>
            <Link 
              href="/patients/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Adicionar o Primeiro Paciente
            </Link>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-600 mb-6">Nenhum paciente corresponde à sua pesquisa por &quot;{searchTerm}&quot;</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Limpar Pesquisa
            </button>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Sessão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(patient.status)}>
                        {patient.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getSessionTypeBadge(patient.session_type)}>
                        {patient.session_type === 'on-site' ? 'On-Site' : 
                         patient.session_type === 'remote' ? 'Remote' : 
                         patient.session_type === 'hybrid' ? 'Hybrid' : 
                         patient.session_type || 'Not set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        Ver mais
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </main>

      {/* Overlay */}
      {showAddSidebar && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowAddSidebar(false)}
        />
      )}

      {/* Add Patient Sidebar */}
      <AddPatientSidebar 
        isOpen={showAddSidebar || editingPatient !== null}
        onClose={() => {
          setShowAddSidebar(false)
          setEditingPatient(null)
        }}
        onSuccess={() => {
          setShowAddSidebar(false)
          setEditingPatient(null)
          fetchPatients(user.id)
        }}
        user={user}
        mode={editingPatient ? 'edit' : 'add'}
        existingPatient={editingPatient}
      />
    </div>
  )
}