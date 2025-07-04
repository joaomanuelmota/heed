'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Calendar, Plus } from 'lucide-react'
import ScheduleSessionSidebar from '../../components/ScheduleSessionSidebar'
import SessionDetailsSidebar from '../../components/SessionDetailsSidebar'

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
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'No time set'
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
      return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Today</span>
    } else if (isPast(session)) {
      return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Past</span>
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Upcoming</span>
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
  console.log('Current filter:', filter, 'Filtered sessions:', filteredSessions)

  return (
    <main key={filter} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Calendar className="w-4 h-4 mr-1" />
                {sessions.filter(s => s.status === 'scheduled' && new Date(`${s.session_date}T${s.session_time}`) > new Date()).length} Scheduled Sessions
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowScheduleSidebar(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule New Session
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="mb-8">
        {/* Filtros customizados */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'all', label: 'All Sessions' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-200 ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white border-blue-600'
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
              {filter === 'today' ? 'No sessions today' : 
               filter === 'week' ? 'No sessions this week' :
               filter === 'month' ? 'No sessions this month' :
               filter === 'upcoming' ? 'No upcoming sessions' :
               'No sessions scheduled'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Get started by scheduling your first session'
                : `No sessions found for the ${filter} filter`
              }
            </p>
            <Link 
              href="/sessions/schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Schedule Your First Session
            </Link>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'today' ? 'No sessions today' : 
               filter === 'week' ? 'No sessions this week' :
               filter === 'month' ? 'No sessions this month' :
               filter === 'upcoming' ? 'No upcoming sessions' :
               'No sessions scheduled'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Get started by scheduling your first session'
                : `No sessions found for the ${filter} filter`
              }
            </p>
            <Link 
              href="/sessions/schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Schedule Your First Session
            </Link>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                        {session.title || 'No title'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(session.session_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(session.session_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {session.duration_minutes} minutes
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
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSessionId(session.id)
                          setSidebarMode('edit')
                          setShowSessionSidebar(true)
                        }}
                        className="text-green-600 hover:text-green-900 bg-transparent border-none cursor-pointer font-medium"
                      >
                        Edit
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
      <ScheduleSessionSidebar 
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
      <SessionDetailsSidebar 
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