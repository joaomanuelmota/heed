'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import ScheduleSessionSidebar from '../../components/ScheduleSessionSidebar'
import SessionDetailsSidebar from '../../components/SessionDetailsSidebar'

export default function Calendar() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, day
  const [showScheduleSidebar, setShowScheduleSidebar] = useState(false)
  const [patients, setPatients] = useState([])
  const [showSessionSidebar, setShowSessionSidebar] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
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

  const fetchPatients = async (psychologistId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, firstName, lastName')
        .eq('psychologist_id', psychologistId)
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
    setView('day')
  }

  const getStatusBadge = (status) => {
    const config = {
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
      'no-show': { label: 'No Show', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    }
    const c = config[status] || config.scheduled
    return <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium border ${c.color}`}>{c.label}</span>
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
              <button
                key={session.id}
                type="button"
                onClick={() => { setSelectedSessionId(session.id); setShowSessionSidebar(true); }}
                className={`block w-full text-left px-2 py-1 rounded-lg text-xs border font-medium cursor-pointer hover:opacity-90 transition-all ${getStatusColor(session.status)} flex items-center justify-between`}
                title={`${formatTime(session.session_time)} - ${session.patients.firstName} ${session.patients.lastName}`}
              >
                <span className="truncate">
                  {session.patients.firstName} {session.patients.lastName}
                </span>
              </button>
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
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => { setSelectedSessionId(session.id); setShowSessionSidebar(true); }}
                    className={`block w-full text-left p-1 rounded text-xs border cursor-pointer hover:opacity-80 ${getStatusColor(session.status)}`}
                  >
                    <div className="font-medium">{formatTime(session.session_time)}</div>
                    <div className="truncate">{session.patients.firstName} {session.patients.lastName}</div>
                  </button>
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
              <button
                key={session.id}
                type="button"
                onClick={() => { setSelectedSessionId(session.id); setShowSessionSidebar(true); }}
                className={`block w-full text-left p-2 mb-1 rounded border cursor-pointer hover:opacity-80 ${getStatusColor(session.status)}`}
              >
                <div className="font-medium text-sm">
                  {formatTime(session.session_time)} - {session.patients.firstName} {session.patients.lastName}
                </div>
                <div className="text-xs">{session.title}</div>
              </button>
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
    <div className="min-h-screen bg-gray-50 p-0 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 md:gap-0 px-4 md:px-0 pt-6 md:pt-0">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScheduleSidebar(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
          >
            Schedule Session
          </button>
        </div>
      </div>
      {/* Navegação mês/semana/dia */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div className="flex gap-2">
          <button onClick={() => navigateMonth(-1)} className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100">&lt;</button>
          <span className="text-lg font-semibold text-gray-900 mx-2">
            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => navigateMonth(1)} className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100">&gt;</button>
        </div>
        <div className="flex gap-2">
          <button onClick={goToToday} className={`px-3 py-1 rounded-lg font-medium ${view === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Today</button>
          <button onClick={() => setView('week')} className={`px-3 py-1 rounded-lg font-medium ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}>Week</button>
          <button onClick={() => setView('month')} className={`px-3 py-1 rounded-lg font-medium ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}>Month</button>
        </div>
      </div>
      {/* Calendário */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-500">Loading calendar...</span>
          </div>
        ) : (
          <>
            {view === 'month' && (
              <div className="grid grid-cols-7 gap-2">
                {/* Dias da semana */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-xs font-semibold text-gray-500 text-center pb-2">{d}</div>
                ))}
                {renderMonthView()}
              </div>
            )}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>
      <ScheduleSessionSidebar
        isOpen={showScheduleSidebar}
        onClose={() => setShowScheduleSidebar(false)}
        onSuccess={() => { setShowScheduleSidebar(false); fetchSessions(user.id); }}
        user={user}
        patients={patients}
      />
      <SessionDetailsSidebar
        isOpen={showSessionSidebar}
        onClose={() => setShowSessionSidebar(false)}
        onSuccess={() => { setShowSessionSidebar(false); fetchSessions(user.id); }}
        user={user}
        patients={patients}
        sessionId={selectedSessionId}
      />
    </div>
  )
}