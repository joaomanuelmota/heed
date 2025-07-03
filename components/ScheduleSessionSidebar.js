'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Save, Calendar, Clock, User, FileText, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ScheduleSessionSidebar({ isOpen, onClose, onSuccess, user, patients, preSelectedPatient = null }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [sessionData, setSessionData] = useState({
    patient_id: preSelectedPatient || '',
    title: '',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    status: 'scheduled',
    notes: ''
  })

  useEffect(() => {
    if (preSelectedPatient && patients.length > 0) {
      const selectedPatient = patients.find(p => p.id == preSelectedPatient)
      if (selectedPatient) {
        setSessionData(prev => ({
          ...prev,
          patient_id: preSelectedPatient,
          title: `Session with ${selectedPatient.firstName} ${selectedPatient.lastName}`
        }))
      }
    }
  }, [preSelectedPatient, patients])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSessionData({
      ...sessionData,
      [name]: value
    })

    // Auto-generate title when patient is selected
    if (name === 'patient_id' && value) {
      const selectedPatient = patients.find(p => p.id == value)
      if (selectedPatient && !sessionData.title) {
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
    setLoading(true)
    setMessage('')

    // Basic validation
    if (!sessionData.patient_id) {
      setMessage('Please select a patient')
      setLoading(false)
      return
    }

    if (!sessionData.session_date || !sessionData.session_time) {
      setMessage('Please select both date and time')
      setLoading(false)
      return
    }

    try {
      const submitData = {
        patient_id: parseInt(sessionData.patient_id),
        title: sessionData.title || `Session with ${patients.find(p => p.id == sessionData.patient_id)?.firstName} ${patients.find(p => p.id == sessionData.patient_id)?.lastName}`,
        session_date: sessionData.session_date,
        session_time: sessionData.session_time,
        duration_minutes: parseInt(sessionData.duration_minutes),
        status: sessionData.status,
        notes: sessionData.notes || null,
        psychologist_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([submitData])

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Session scheduled successfully!')
        
        // Reset form
        setSessionData({
          patient_id: '',
          title: '',
          session_date: '',
          session_time: '',
          duration_minutes: 60,
          status: 'scheduled',
          notes: ''
        })
        
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setLoading(false)
  }

  // Função para obter a data mínima (hoje)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Gerar horários disponíveis
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

  // CustomDropdown copiado do AddPatientSidebar
  function CustomDropdown({ value, options, onChange, disabled, placeholder }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selected = options.find(opt => opt.value === value)

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none"
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <span className="flex items-center">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
        {open && (
          <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                  value === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'
                }`}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-[60] overflow-y-auto" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms ease-in-out' }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Session</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Mensagem de sucesso/erro */}
        {message && (
          <div className={`p-3 mb-6 rounded-lg text-sm text-center ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Patient *
              </label>
              {preSelectedPatient && patients.length > 0 ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed">
                  {patients.find(p => p.id == preSelectedPatient)?.firstName} {patients.find(p => p.id == preSelectedPatient)?.lastName}
                </div>
              ) : (
                <CustomDropdown
                  value={sessionData.patient_id}
                  options={patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
                  onChange={val => handleChange({ target: { name: 'patient_id', value: val } })}
                  disabled={loading}
                  placeholder="Select a patient"
                />
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="e.g., Therapy Session, Follow-up, Initial Consultation"
                disabled={loading}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Time *
                </label>
                <CustomDropdown
                  value={sessionData.session_time}
                  options={generateTimeSlots().map(slot => ({ value: slot.value, label: slot.display }))}
                  onChange={val => handleChange({ target: { name: 'session_time', value: val } })}
                  disabled={loading}
                  placeholder="Select time"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Duration (minutes)
              </label>
              <select
                name="duration_minutes"
                value={sessionData.duration_minutes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={loading}
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
                Session Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={sessionData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any notes about this session..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={loading}
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 