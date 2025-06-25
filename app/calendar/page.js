'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Calendar() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, day
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
      // Get sessions data
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

      // Get patients data separately and merge
      if (sessionsData && sessionsData.length > 0) {
        const patientIds = [...new Set(sessionsData.map(session => session.patient_id))]
        
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, firstName, lastName')
          .in('id', patientIds)

        if (patientsError) {
          console.error('Error fetching patients:', patientsError)
        }

        // Merge sessions with patient data
        const sessionsWithPatients = sessionsData.map(session => {
          const patient = patientsData?.find(p => p.id === session.patient_id)
          return {
            ...session,
            patients: patient || { firstName: 'Unknown', lastName: 'Patient' }
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

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getSessionsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return sessions.filter(session => session.session_date === dateString)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-200"></div>
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const daySessions = getSessionsForDate(date)
      const isCurrentDay = isToday(date)

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-1 overflow-hidden ${
            isCurrentDay ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
            {isCurrentDay && (
              <span className="ml-1 px-1 py-0.5 text-xs bg-blue-600 text-white rounded">Today</span>
            )}
          </div>
          
          <div className="space-y-1">
            {daySessions.slice(0, 2).map((session) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className={`block px-1 py-0.5 rounded text-xs border cursor-pointer hover:opacity-80 ${getStatusColor(session.status)}`}
                title={`${formatTime(session.session_time)} - ${session.patients.firstName} ${session.patients.lastName}`}
              >
                <div className="truncate">
                  {formatTime(session.session_time)} {session.patients.firstName}
                </div>
              </Link>
            ))}
            {daySessions.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{daySessions.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(currentDate.getDate() - day)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDays.push(date)
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, index) => {
          const daySessions = getSessionsForDate(date)
          const isCurrentDay = isToday(date)

          return (
            <div
              key={index}
              className={`min-h-96 border border-gray-200 p-2 ${
                isCurrentDay ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
            >
              <div className={`text-sm font-medium mb-2 text-center ${
                isCurrentDay ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                <br />
                <span className={`text-lg ${isCurrentDay ? 'font-bold' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
              
              <div className="space-y-1">
                {daySessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className={`block p-1 rounded text-xs border cursor-pointer hover:opacity-80 ${getStatusColor(session.status)}`}
                  >
                    <div className="font-medium">{formatTime(session.session_time)}</div>
                    <div className="truncate">{session.patients.firstName} {session.patients.lastName}</div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderDayView = () => {
    const daySessions = getSessionsForDate(currentDate)
    const timeSlots = []

    // Generate hourly time slots from 8 AM to 8 PM
    for (let hour = 8; hour < 20; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      })

      const slotSessions = daySessions.filter(session => {
        const sessionHour = parseInt(session.session_time?.split(':')[0] || '0')
        return sessionHour === hour
      })

      timeSlots.push(
        <div key={hour} className="flex border-b border-gray-200">
          <div className="w-20 p-2 text-sm text-gray-600 bg-gray-50">
            {displayTime}
          </div>
          <div className="flex-1 p-2 min-h-16">
            {slotSessions.map((session) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className={`block p-2 mb-1 rounded border cursor-pointer hover:opacity-80 ${getStatusColor(session.status)}`}
              >
                <div className="font-medium text-sm">
                  {formatTime(session.session_time)} - {session.patients.firstName} {session.patients.lastName}
                </div>
                <div className="text-xs">{session.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {timeSlots}
      </div>
    )
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {/* Calendar Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                Today
              </button>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric',
                  ...(view === 'day' && { day: 'numeric' })
                })}
              </h2>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'month', label: 'Month' },
                { key: 'week', label: 'Week' },
                { key: 'day', label: 'Day' }
              ].map((viewOption) => (
                <button
                  key={viewOption.key}
                  onClick={() => setView(viewOption.key)}
                  className={`px-3 py-1 rounded font-medium text-sm ${
                    view === viewOption.key
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {viewOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2"></div>
            <span>No Show</span>
          </div>
        </div>

        {/* Calendar Grid */}
        {view === 'month' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {renderMonthView()}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {renderWeekView()}
          </div>
        )}

        {view === 'day' && renderDayView()}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions scheduled</h3>
            <p className="text-gray-600 mb-6">Get started by scheduling your first session</p>
            <Link 
              href="/sessions/schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Schedule Your First Session
            </Link>
          </div>
        )}
      </main>
    </>
  )
}