'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { formatDateLong, formatTime12Hour } from '../../../lib/dateUtils'
import { Button } from '../../../components/Button'

export default function SessionDetails() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        fetchSession(user.id, params.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  const fetchSession = async (psychologistId, sessionId) => {
    try {
      // Get session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('psychologist_id', psychologistId)
        .single()

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          setError('Session not found or you do not have permission to view this session.')
        } else {
          setError(`Error fetching session: ${sessionError.message}`)
        }
        setLoading(false)
        return
      }

      setSession(sessionData)
      setNotes(sessionData.notes || '')
      setStatus(sessionData.status || 'scheduled')

      // Get patient data
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', sessionData.patient_id)
        .single()

      if (patientError) {
        console.error('Error fetching patient:', patientError)
        setPatient({ firstName: 'Unknown', lastName: 'Patient' })
      } else {
        setPatient(patientData)
      }

    } catch (error) {
      setError(`Unexpected error: ${error.message}`)
    }
    
    setLoading(false)
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          notes: notes,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)
        .eq('psychologist_id', user.id)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Session updated successfully!')
        // Update local session data
        setSession(prev => ({ ...prev, notes, status }))
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setSaving(false)
  }

  const handleDeleteSession = async () => {
    if (!confirm(`Are you sure you want to delete this session? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id)
        .eq('psychologist_id', user.id)

      if (error) {
        alert(`Error deleting session: ${error.message}`)
      } else {
        alert('Session deleted successfully')
        router.push('/sessions')
      }
    } catch (error) {
      alert(`Unexpected error: ${error.message}`)
    }
  }

  const formatDate = (dateString) => {
    return formatDateLong(dateString)
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'No time set'
    return formatTime12Hour(timeString)
  }

  const getSessionDateTime = () => {
    if (!session) return null
    return new Date(`${session.session_date}T${session.session_time}`)
  }

  const isSessionToday = () => {
    if (!session) return false
    const today = new Date()
    const sessionDate = new Date(session.session_date)
    return sessionDate.toDateString() === today.toDateString()
  }

  const isSessionPast = () => {
    const sessionDateTime = getSessionDateTime()
    if (!sessionDateTime) return false
    return sessionDateTime < new Date()
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link 
            href="/sessions"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  if (!session || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Session not found</div>
          <Link 
            href="/sessions"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Session with {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-600">
                {formatDate(session.session_date)} at {formatTime(session.session_time)}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link 
                href={`/sessions/${session.id}/edit`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Edit Session
              </Link>
              <Link 
                href="/sessions"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Back to Sessions
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success/Error Message */}
        {message && (
          <div className={`p-3 mb-6 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Session Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Patient</label>
                  <p className="text-gray-900">
                    <Link 
                      href={`/patients/${patient.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {patient.firstName} {patient.lastName}
                    </Link>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900">{formatDate(session.session_date)}</p>
                  {isSessionToday() && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      Hoje
                    </span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Time</label>
                  <p className="text-gray-900">{formatTime(session.session_time)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900">{session.duration_minutes} minutes</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Title</label>
                  <p className="text-gray-900">{session.title || 'No title'}</p>
                </div>

                {session.google_meet_link && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Google Meet</label>
                    <a 
                      href={session.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{formatDate(session.created_at)}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  {session.google_meet_link ? (
                    <a
                      href={session.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium text-sm block text-center"
                    >
                      Join Google Meet
                    </a>
                  ) : (
                    <button 
                      className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed"
                      disabled
                      title="No Google Meet link available"
                    >
                      No Meet Link Available
                    </button>
                  )}
                  <button 
                    onClick={handleDeleteSession}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium text-sm"
                  >
                    Delete Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Notes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Session Notes</h3>
                <Button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-medium"
                >
                  {saving ? 'A guardar...' : 'Guardar Notas'}
                </Button>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="20"
                placeholder="Add your session notes here...

Topics discussed:
- 

Observations:
- 

Action items:
- 

Next session goals:
- "
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-gray-900"
              />
              
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {session.updated_at ? new Date(session.updated_at).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}