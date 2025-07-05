'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Save, Calendar, Clock, User, FileText, ChevronDown, Edit, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDateLong, formatTime12Hour, generateTimeSlots } from '../lib/dateUtils'
import Link from 'next/link'

export default function SessionDetailsSidebar({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user, 
  patients, 
  sessionId, 
  mode = 'view' // 'view' or 'edit'
}) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [currentMode, setCurrentMode] = useState(mode)
  const [session, setSession] = useState(null)
  const [patient, setPatient] = useState(null)

  const [sessionData, setSessionData] = useState({
    patient_id: '',
    title: '',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    status: 'scheduled',
    notes: '',
    session_fee: ''
  })

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSession()
    }
  }, [isOpen, sessionId])

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode])

  const fetchSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('psychologist_id', user.id)
        .single()

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setSession(data)
        setSessionData({
          patient_id: data.patient_id,
          title: data.title || '',
          session_date: data.session_date || '',
          session_time: data.session_time || '',
          duration_minutes: data.duration_minutes || 60,
          status: data.status || 'scheduled',
          notes: data.notes || '',
          session_fee: data.session_fee !== undefined && data.session_fee !== null ? data.session_fee : ''
        })

        // Find the patient
        const patientData = patients.find(p => p.id === data.patient_id)
        setPatient(patientData)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSessionData({
      ...sessionData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (!sessionData.session_fee || isNaN(Number(sessionData.session_fee))) {
      setMessage('Por favor, insira o valor da sessão')
      setSaving(false)
      return
    }

    try {
      const updateData = {
        patient_id: parseInt(sessionData.patient_id),
        title: sessionData.title,
        session_date: sessionData.session_date,
        session_time: sessionData.session_time,
        duration_minutes: parseInt(sessionData.duration_minutes),
        status: sessionData.status,
        notes: sessionData.notes || null,
        session_fee: Number(sessionData.session_fee),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('psychologist_id', user.id)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Sessão atualizada com sucesso!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setSaving(false)
  }

  const handleStatusUpdate = async (newStatus) => {
    setSaving(true)
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
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Status updated successfully!')
        setSessionData(prev => ({ ...prev, status: newStatus }))
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }
    setSaving(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return formatDateLong(dateString)
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set'
    return formatTime12Hour(timeString)
  }

  const isSessionToday = () => {
    if (!session?.session_date) return false
    const today = new Date()
    const sessionDate = new Date(session.session_date)
    return sessionDate.toDateString() === today.toDateString()
  }

  const getMinDate = () => {
    return '2020-01-01'
  }

  const generateTimeSlotsLocal = () => {
    return generateTimeSlots()
  }

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
          className={`w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <span>{selected ? selected.label : placeholder}</span>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
        {open && (
          <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
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

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-[60] overflow-y-auto" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms ease-in-out' }}>
        <div className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-[60] overflow-y-auto" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms ease-in-out' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentMode === 'view' ? 'Detalhes da Sessão' : 'Editar Sessão'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`p-3 mb-6 rounded-lg text-sm text-center ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {session && patient && (
          <>
            {currentMode === 'view' ? (
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Paciente</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {patient ? `${patient.firstName} ${patient.lastName}` : ''}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Título da Sessão</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {session.title || 'Sem título'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Data</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {formatDate(session.session_date)}
                                      {isSessionToday() && (
                  <span className="inline-block ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Hoje</span>
                )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Hora</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {formatTime(session.session_time)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Valor da Sessão (€)</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {typeof session.session_fee === 'number' ? `€${session.session_fee.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Duração (minutos)</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {session.duration_minutes} minutos
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Estado</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Notas da Sessão</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 whitespace-pre-wrap min-h-[60px]">
                    {session.notes || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Criado</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {formatDate(session.created_at)}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Paciente</label>
                  {patient ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed">
                      {patient.firstName} {patient.lastName}
                    </div>
                  ) : (
                    <CustomDropdown
                      value={sessionData.patient_id}
                      options={patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
                      onChange={val => handleChange({ target: { name: 'patient_id', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar um paciente"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Título da Sessão</label>
                  <input
                    type="text"
                    name="title"
                    value={sessionData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="ex: Sessão de Terapia, Acompanhamento"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Data</label>
                    <input
                      type="date"
                      name="session_date"
                      value={sessionData.session_date}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Hora</label>
                    <CustomDropdown
                      value={sessionData.session_time}
                      options={generateTimeSlotsLocal().map(slot => ({ value: slot.value, label: slot.display }))}
                      onChange={val => handleChange({ target: { name: 'session_time', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar hora"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Valor da Sessão (€) *</label>
                    <input
                      type="number"
                      name="session_fee"
                      value={sessionData.session_fee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="Valor (€)"
                      min="0"
                      step="0.01"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Duração (minutos)</label>
                    <CustomDropdown
                      value={sessionData.duration_minutes}
                      options={[
                        { value: 30, label: '30 minutos' },
                        { value: 45, label: '45 minutos' },
                        { value: 60, label: '60 minutos' },
                        { value: 90, label: '90 minutos' },
                        { value: 120, label: '2 horas' }
                      ]}
                      onChange={val => handleChange({ target: { name: 'duration_minutes', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar duração"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Estado</label>
                    <CustomDropdown
                      value={sessionData.status}
                      options={[
                        { value: 'scheduled', label: 'Agendada' },
                        { value: 'completed', label: 'Concluída' },
                        { value: 'cancelled', label: 'Cancelada' },
                        { value: 'no-show', label: 'Não Compareceu' }
                      ]}
                      onChange={val => handleChange({ target: { name: 'status', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar estado"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Notas da Sessão</label>
                  <textarea
                    name="notes"
                    value={sessionData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Qualquer nota sobre esta sessão..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    disabled={saving}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentMode('view')}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {saving ? 'A guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
} 