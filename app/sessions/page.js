'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { formatDateLong, formatTime12Hour } from '../../lib/dateUtils'
import { Calendar, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import Button from '../../components/Button'

const ScheduleSessionSidebarLazy = dynamic(() => import('../../components/ScheduleSessionSidebar'), { ssr: false, loading: () => <div className="p-4 text-gray-400">Carregando agendamento...</div> })
const SessionDetailsSidebarLazy = dynamic(() => import('../../components/SessionDetailsSidebar'), { ssr: false, loading: () => <div className="p-4 text-gray-400">Carregando detalhes da sessão...</div> })

export default function Sessions() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('today')
  const [showScheduleSidebar, setShowScheduleSidebar] = useState(false)
  const [showSessionSidebar, setShowSessionSidebar] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [sidebarMode, setSidebarMode] = useState('view') // 'view' or 'edit'
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        fetchSessions(user.id)
        fetchPatients(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  const fetchSessions = async (psychologistId) => {
    try {
      // First get sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true })

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
        setLoading(false)
        return
      }

      // Then get patients data separately and merge
      if (sessionsData && sessionsData.length > 0) {
        const patientIds = [...new Set(sessionsData.map(session => session.patient_id))]
        
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, firstName, lastName, email, phone')
          .in('id', patientIds)

        if (patientsError) {
          console.error('Error fetching patients:', patientsError)
        }

        // Merge sessions with patient data
        const sessionsWithPatients = sessionsData.map(session => {
          const patient = patientsData?.find(p => p.id === session.patient_id)
          return {
            ...session,
            patients: patient || { firstName: 'Unknown', lastName: 'Patient', email: '', phone: '' }
          }
        })

        setSessions(sessionsWithPatients)
      } else {
        setSessions([])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
    
    setLoading(false)
  }

  const fetchPatients = async (psychologistId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, firstName, lastName')
        .eq('psychologist_id', psychologistId)
        .eq('status', 'active')
        .order('firstName', { ascending: true })

      if (error) {
        console.error('Error fetching patients:', error)
      } else {
        setPatients(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  const formatDate = (dateString) => {
    return formatDateLong(dateString)
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Sem horário definido'
    return formatTime12Hour(timeString)
  }

  const getSessionDateTime = (session) => {
    const sessionDate = new Date(`${session.session_date}T${session.session_time}`)
    return sessionDate
  }

  const isToday = (session) => {
    const today = new Date()
    const sessionDate = new Date(session.session_date)
    return sessionDate.toDateString() === today.toDateString()
  }

  const isPast = (session) => {
    const now = new Date()
    const sessionDateTime = getSessionDateTime(session)
    return sessionDateTime < now
  }

  const isUpcoming = (session) => {
    const now = new Date()
    const sessionDateTime = getSessionDateTime(session)
    return sessionDateTime > now
  }

  const isThisWeek = (session) => {
    const sessionDate = new Date(session.session_date)
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0,0,0,0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() - today.getDay() + 6)
    endOfWeek.setHours(23,59,59,999)
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek
  }

  const isThisMonth = (session) => {
    const sessionDate = new Date(session.session_date)
    const today = new Date()
    return sessionDate.getMonth() === today.getMonth() && sessionDate.getFullYear() === today.getFullYear()
  }

  const getFilteredSessions = () => {
    switch(filter) {
      case 'today':
        return sessions.filter(isToday)
      case 'week':
        return sessions.filter(isThisWeek)
      case 'month':
        return sessions.filter(isThisMonth)
      case 'upcoming':
        return sessions.filter(isUpcoming)
      case 'past':
        return sessions.filter(isPast)
      case 'all':
        return sessions
      default:
        return sessions.filter(isToday)
    }
  }

  const getSessionStatusBadge = (session) => {
    if (isToday(session)) {
      return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Hoje</span>
    } else if (isPast(session)) {
      return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Passado</span>
    } else {
              return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Próximas</span>
    }
  }

  const getSessionStateBadge = (session) => {
    const status = session.status || 'scheduled'
    
    switch(status) {
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">Agendada</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Concluída</span>
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Cancelada</span>
      case 'no-show':
        return <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">Não Compareceu</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Agendada</span>
    }
  }

  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('psychologist_id', user.id)

      if (error) {
        alert(`Error updating session: ${error.message}`)
      } else {
        // Refresh sessions
        fetchSessions(user.id)
      }
    } catch (error) {
      alert(`Unexpected error: ${error.message}`)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredSessions = getFilteredSessions()

  return (
    <main key={filter} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Sessões</h1>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Calendar className="w-4 h-4 mr-1" />
                {sessions.filter(s => s.status === 'scheduled' && new Date(`${s.session_date}T${s.session_time}`) > new Date()).length} Sessões Agendadas
              </span>
            </div>
          </div>
          <Button 
            onClick={() => setShowScheduleSidebar(true)}
            className="inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agendar Nova Sessão
          </Button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="mb-8">
        {/* Filtros customizados */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'today', label: 'Hoje' },
            { key: 'week', label: 'Esta Semana' },
            { key: 'month', label: 'Este Mês' },
            { key: 'all', label: 'Todas as Sessões' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                filter === filterOption.key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        patients.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'today' ? 'Nenhuma sessão hoje' : 
               filter === 'week' ? 'Nenhuma sessão esta semana' :
               filter === 'month' ? 'Nenhuma sessão este mês' :
               filter === 'upcoming' ? 'Nenhuma sessão próxima' :
               'Nenhuma sessão agendada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Comece por agendar a sua primeira sessão'
                : `Nenhuma sessão encontrada para o filtro ${filter}`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'today' ? 'Nenhuma sessão hoje' : 
               filter === 'week' ? 'Nenhuma sessão esta semana' :
               filter === 'month' ? 'Nenhuma sessão este mês' :
               filter === 'upcoming' ? 'Nenhuma sessão próxima' :
               'Nenhuma sessão agendada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Comece por agendar a sua primeira sessão'
                : `Nenhuma sessão encontrada para o filtro ${filter}`
              }
            </p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PACIENTE</th>
                  <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 min-w-[220px]">DATA & HORA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.patients.firstName} {session.patients.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.title || 'Sem título'}
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateLong(session.session_date)}
                      </div>
                      {session.session_time && (
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const start = session.session_time.slice(0,5)
                            let [h, m] = start.split(":").map(Number)
                            const endDate = new Date(0,0,0,h,m)
                            endDate.setMinutes(endDate.getMinutes() + (session.duration_minutes || 60))
                            const end = endDate.toTimeString().slice(0,5)
                            return `${start} - ${end} (${session.duration_minutes || 60} min)`
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getSessionStateBadge(session)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedSessionId(session.id)
                          setSidebarMode('view')
                          setShowSessionSidebar(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4 bg-transparent border-none cursor-pointer font-medium"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSessionId(session.id)
                          setSidebarMode('edit')
                          setShowSessionSidebar(true)
                        }}
                        className="text-green-600 hover:text-green-900 bg-transparent border-none cursor-pointer font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Session Sidebar */}
      <ScheduleSessionSidebarLazy 
        isOpen={showScheduleSidebar}
        onClose={() => setShowScheduleSidebar(false)}
        onSuccess={() => {
          setShowScheduleSidebar(false)
          fetchSessions(user.id)
        }}
        user={user}
        patients={patients}
      />

      {/* Session Details Sidebar */}
      <SessionDetailsSidebarLazy 
        isOpen={showSessionSidebar}
        onClose={() => {
          setShowSessionSidebar(false)
          setSelectedSessionId(null)
        }}
        onSuccess={() => {
          setShowSessionSidebar(false)
          setSelectedSessionId(null)
          fetchSessions(user.id)
        }}
        user={user}
        patients={patients}
        sessionId={selectedSessionId}
        mode={sidebarMode}
      />
    </main>
  )
}