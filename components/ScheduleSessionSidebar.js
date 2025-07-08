'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Save, Calendar, Clock, User, FileText, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateTimeSlots } from '../lib/dateUtils'
import Button from './Button'

export default function ScheduleSessionSidebar({ isOpen, onClose, onSuccess, user, patients, preSelectedPatient = null }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dateInputType, setDateInputType] = useState('text')

  const [sessionData, setSessionData] = useState({
    patient_id: preSelectedPatient || '',
    title: 'Sessão de Psicologia',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    status: 'scheduled',
    payment_status: 'to pay',
    notes: '',
    session_fee: ''
  })

  useEffect(() => {
    if (preSelectedPatient && patients.length > 0) {
      setSessionData(prev => ({
        ...prev,
        patient_id: preSelectedPatient
      }))
    }
  }, [preSelectedPatient, patients])

  useEffect(() => {
    if (isOpen) {
      setMessage('');
    }
  }, [isOpen]);

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
          title: `Sessão com ${selectedPatient.firstName} ${selectedPatient.lastName}`
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

    if (!sessionData.session_fee || isNaN(Number(sessionData.session_fee))) {
      setMessage('Por favor, insira o valor da sessão')
      setLoading(false)
      return
    }

    try {
      const submitData = {
        patient_id: parseInt(sessionData.patient_id),
        title: sessionData.title || `Sessão com ${patients.find(p => p.id == sessionData.patient_id)?.firstName} ${patients.find(p => p.id == sessionData.patient_id)?.lastName}`,
        session_date: sessionData.session_date,
        session_time: sessionData.session_time,
        duration_minutes: parseInt(sessionData.duration_minutes),
        status: sessionData.status,
        payment_status: sessionData.payment_status || 'to pay',
        notes: sessionData.notes || null,
        session_fee: Number(sessionData.session_fee),
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
        setMessage('Sessão agendada com sucesso!')
        
        // Reset form
        setSessionData({
          patient_id: '',
          title: '',
          session_date: '',
          session_time: '',
          duration_minutes: 60,
          status: 'scheduled',
          payment_status: 'to pay',
          notes: '',
          session_fee: ''
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
  const generateTimeSlotsLocal = () => {
    return generateTimeSlots()
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
          <h2 className="text-xl font-semibold text-gray-900">Agendar Sessão</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Mensagem de sucesso/erro */}
        {message && (
          <div className={`p-3 mb-6 rounded-lg text-sm text-center ${
            message.toLowerCase().includes('sucesso') || message.toLowerCase().includes('success')
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Details */}
          <div>
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
                placeholder="Paciente *"
              />
            )}
          </div>
          {/* Session Info */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="title"
                value={sessionData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Título da Sessão"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type={dateInputType}
                  name="session_date"
                  value={sessionData.session_date}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  required
                  disabled={loading}
                  placeholder="Data da Sessão"
                  onFocus={() => setDateInputType('date')}
                  onBlur={e => { if (!e.target.value) setDateInputType('text') }}
                />
              </div>
              <div>
                <CustomDropdown
                  value={sessionData.session_time}
                  options={generateTimeSlotsLocal().map(slot => ({ value: slot.value, label: slot.display }))}
                  onChange={val => handleChange({ target: { name: 'session_time', value: val } })}
                  disabled={loading}
                  placeholder="Hora *"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="session_fee"
                  value={sessionData.session_fee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Valor da Sessão (€) *"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <CustomDropdown
                  value={sessionData.duration_minutes}
                  options={[
                    { value: 30, label: '30 minutos' },
                    { value: 45, label: '45 minutos' },
                    { value: 60, label: '60 minutos' },
                    { value: 90, label: '90 minutos' },
                    { value: 120, label: '2 horas' },
                  ]}
                  onChange={val => handleChange({ target: { name: 'duration_minutes', value: val } })}
                  disabled={loading}
                  placeholder="Duração (minutos)"
                />
              </div>
            </div>
            <div>
              <textarea
                name="notes"
                value={sessionData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Notas da Sessão (Opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={loading}
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'A agendar...' : 'Agendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 