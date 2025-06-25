'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Sessions() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past, today
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

  const getFilteredSessions = () => {
    switch (filter) {
      case 'today':
        return sessions.filter(isToday)
      case 'upcoming':
        return sessions.filter(isUpcoming)
      case 'past':
        return sessions.filter(isPast)
      default:
        return sessions
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Stats & Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <p className="text-2xl font-bold text-blue-600">{sessions.filter(isToday).length}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <p className="text-2xl font-bold text-green-600">{sessions.filter(isUpcoming).length}</p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <p className="text-2xl font-bold text-gray-600">{sessions.filter(isPast).length}</p>
            <p className="text-sm text-gray-600">Past</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Sessions' },
            { key: 'today', label: 'Today' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No sessions scheduled' : `No ${filter} sessions`}
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Sessions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Sessions`}
            </h3>
          </div>
          
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
                    Status
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSessionStatusBadge(session)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/sessions/${session.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/sessions/${session.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
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
  )
}