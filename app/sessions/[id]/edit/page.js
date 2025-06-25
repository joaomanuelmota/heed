'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

export default function EditSession() {
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()

  const [sessionData, setSessionData] = useState({
    patient_id: '',
    title: '',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    status: 'scheduled',
    notes: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        await Promise.all([
          fetchPatients(user.id),
          fetchSession(user.id, params.id)
        ])
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

  const fetchSession = async (psychologistId, sessionId) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('psychologist_id', psychologistId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Session not found or you do not have permission to edit this session.')
        } else {
          setError(`Error fetching session: ${error.message}`)
        }
      } else {
        // Populate form with existing data
        setSessionData({
          patient_id: data.patient_id || '',
          title: data.title || '',
          session_date: data.session_date || '',
          session_time: data.session_time || '',
          duration_minutes: data.duration_minutes || 60,
          status: data.status || 'scheduled',
          notes: data.notes || ''
        })
      }
    } catch (error) {
      setError(`Unexpected error: ${error.message}`)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSessionData({
      ...sessionData,
      [name]: value
    })

    // Auto-update title when patient is selected
    if (name === 'patient_id' && value) {
      const selectedPatient = patients.find(p => p.id == value)
      if (selectedPatient && !sessionData.title.includes(selectedPatient.firstName)) {
        setSessionData(prev => ({
          ...prev,
          [name]: value,
          title: `Session with ${selectedPatient.firstName} ${selectedPatient.lastName}`
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Basic validation
    if (!sessionData.patient_id) {
      setMessage('Please select a patient')
      setSaving(false)
      return
    }

    if (!sessionData.session_date || !sessionData.session_time) {
      setMessage('Please select both date and time')
      setSaving(false)
      return
    }

    try {
      // Prepare session data
      const updateData = {
        patient_id: parseInt(sessionData.patient_id),
        title: sessionData.title,
        session_date: sessionData.session_date,
        session_time: sessionData.session_time,
        duration_minutes: parseInt(sessionData.duration_minutes),
        status: sessionData.status,
        notes: sessionData.notes || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', params.id)
        .eq('psychologist_id', user.id)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Session updated successfully!')
        
        // Redirect to session details after 2 seconds
        setTimeout(() => {
          router.push(`/sessions/${params.id}`)
        }, 2000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setSaving(false)
  }

  // Get minimum date (today for future sessions, or allow past dates for existing sessions)
  const getMinDate = () => {
    const today = new Date()
    return '2020-01-01' // Allow editing past sessions
  }

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        slots.push({ value: timeString, display: displayTime })
      }
    }
    return slots
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Session</h1>
              <p className="text-gray-600">
                {sessionData.title || 'Update session details'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link 
                href={`/sessions/${params.id}`}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          
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

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Patient Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Patient *
                </label>
                <select
                  name="patient_id"
                  value={sessionData.patient_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                  required
                  disabled={saving}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={sessionData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                  placeholder="e.g., Therapy Session, Follow-up, Initial Consultation"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="session_date"
                    value={sessionData.session_date}
                    onChange={handleChange}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Time *
                  </label>
                  <select
                    name="session_time"
                    value={sessionData.session_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    required
                    disabled={saving}
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.display}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration_minutes"
                    value={sessionData.duration_minutes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={sessionData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Session Notes
                </label>
                <textarea
                  name="notes"
                  value={sessionData.notes}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Session notes, observations, action items..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href={`/sessions/${params.id}`}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-lg font-medium ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}