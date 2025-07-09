'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Save, Calendar, Clock, User, FileText, ChevronDown, Edit, Eye, AlertTriangle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDateLong, formatTime12Hour, generateTimeSlots, validarNumero } from '../lib/dateUtils'
import Link from 'next/link'
import Button from './Button'
import CustomDropdown from './CustomDropdown'

export default function SessionDetailsSidebar(props) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [currentMode, setCurrentMode] = useState(props.mode)
  const [session, setSession] = useState(null)
  const [patient, setPatient] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const [sessionData, setSessionData] = useState({
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

  useEffect(() => {
    if (props.isOpen && props.sessionId) {
      fetchSession()
    }
  }, [props.isOpen, props.sessionId])

  useEffect(() => {
    setCurrentMode(props.mode)
  }, [props.mode])

  useEffect(() => {
    if (props.isOpen) {
      setMessage('');
      setErrors({})
    }
  }, [props.isOpen, props.sessionId]);

  const validate = () => {
    const newErrors = {}
    if (!sessionData.patient_id) newErrors.patient_id = 'Por favor, selecione um paciente.'
    if (!sessionData.session_date) newErrors.session_date = 'Por favor, selecione a data.'
    if (!sessionData.session_time) newErrors.session_time = 'Por favor, selecione a hora.'
    if (!sessionData.session_fee || !validarNumero(sessionData.session_fee)) newErrors.session_fee = 'Por favor, insira um valor válido para a sessão.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', props.sessionId)
        .eq('psychologist_id', props.user.id)
        .single()

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setSession(data)
        setSessionData({
          patient_id: data.patient_id,
          title: data.title || '',
          session_date: data.session_date || '',
          session_time: data.session_time ? data.session_time.slice(0,5) : '', // Normaliza para HH:MM
          duration_minutes: data.duration_minutes || 60,
          status: data.status || 'scheduled',
          payment_status: data.payment_status || 'to pay',
          notes: data.notes || '',
          session_fee: data.session_fee !== undefined && data.session_fee !== null ? data.session_fee : ''
        })

        // Find the patient
        const patientData = props.patients.find(p => p.id === data.patient_id)
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
    setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!validate()) return
    setSaving(true)
    setMessage('')

    try {
      const updateData = {
        patient_id: parseInt(sessionData.patient_id),
        title: sessionData.title,
        session_date: sessionData.session_date,
        session_time: sessionData.session_time,
        duration_minutes: parseInt(sessionData.duration_minutes),
        status: sessionData.status,
        payment_status: sessionData.payment_status || 'to pay',
        notes: sessionData.notes || null,
        session_fee: Number(sessionData.session_fee),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', props.sessionId)
        .eq('psychologist_id', props.user.id)

      if (error) {
        setMessage(`Erro: ${error.message}`)
      } else {
        setMessage('Sessão atualizada com sucesso!')
        setTimeout(() => {
          props.onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
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
        .eq('id', props.sessionId)
        .eq('psychologist_id', props.user.id)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Status updated successfully!')
        setSessionData(prev => ({ ...prev, status: newStatus }))
        setTimeout(() => {
          props.onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }
    setSaving(false)
  }

  const handleDeleteSession = async () => {
    if (!session) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id)
        .eq('psychologist_id', props.user.id)
      if (error) {
        setMessage(`Erro ao apagar sessão: ${error.message}`)
      } else {
        setMessage('Sessão apagada com sucesso!')
        setTimeout(() => {
          setShowDeleteConfirm(false)
          props.onSuccess()
          props.onClose()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }
    setSaving(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
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

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-[60] overflow-y-auto" style={{ transform: props.isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms ease-in-out' }}>
        <div className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-[60] overflow-y-auto" style={{ transform: props.isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms ease-in-out' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentMode === 'view' ? 'Detalhes da Sessão' : 'Editar Sessão'}
            </h2>
          </div>
          <button onClick={props.onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`p-3 mb-6 rounded-lg text-sm text-center ${
            message.toLowerCase().includes('sucesso') || message.toLowerCase().includes('success')
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {session && patient && (
          <>
            {currentMode === 'view' ? (
              <>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="details-patient" className="block text-gray-700 text-sm font-medium mb-2">Paciente</label>
                    <input
                      type="text"
                      value={patient ? `${patient.firstName} ${patient.lastName}` : ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                      disabled
                      id="details-patient"
                    />
                  </div>
                  <div>
                    <label htmlFor="details-title" className="block text-gray-700 text-sm font-medium mb-2">Título da Sessão</label>
                    <input
                      id="details-title"
                      type="text"
                      value={session.title || 'Sem título'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="details-date" className="block text-gray-700 text-sm font-medium mb-2">Data</label>
                      <input
                        id="details-date"
                        type="text"
                        value={formatDate(session.session_date)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Hora</label>
                      <input
                        type="text"
                        value={formatTime(session.session_time)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Valor da Sessão (€)</label>
                      <input
                        type="text"
                        value={typeof session.session_fee === 'number' ? `€${session.session_fee.toFixed(2)}` : '—'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Duração (minutos)</label>
                      <input
                        type="text"
                        value={`${session.duration_minutes} minutos`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Estado</label>
                      <input
                        type="text"
                        value={session.status === 'scheduled' ? 'Agendada' : session.status === 'completed' ? 'Realizada' : session.status === 'cancelled' ? 'Cancelada' : ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Estado de Pagamento</label>
                      <input
                        type="text"
                        value={session.payment_status === 'paid' ? 'Pago' : session.payment_status === 'to pay' ? 'Não Pago' : session.payment_status === 'invoice issued' ? 'Fatura Emitida' : ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Notas da Sessão</label>
                    <textarea
                      value={session.notes || '—'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 whitespace-pre-wrap min-h-[60px] cursor-not-allowed"
                      disabled
                    />
                  </div>
                </form>
                <div className="flex justify-end mt-6">
                   <Button
                     type="button"
                     onClick={() => setCurrentMode('edit')}
                     className="bg-black text-white hover:bg-gray-900"
                   >
                     Editar
                   </Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="details-patient" className="block text-gray-700 text-sm font-medium mb-2">Paciente</label>
                  {patient ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed" id="details-patient">
                      {patient.firstName} {patient.lastName}
                    </div>
                  ) : (
                    <CustomDropdown
                      value={sessionData.patient_id}
                      options={props.patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
                      onChange={val => handleChange({ target: { name: 'patient_id', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar um paciente"
                      id="details-patient"
                    />
                  )}
                  {errors.patient_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="details-title" className="block text-gray-700 text-sm font-medium mb-2">Título da Sessão</label>
                  <input
                    id="details-title"
                    type="text"
                    name="title"
                    value={sessionData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="ex: Sessão de Terapia, Acompanhamento"
                    disabled={saving}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="details-date" className="block text-gray-700 text-sm font-medium mb-2">Data</label>
                    <input
                      id="details-date"
                      type="date"
                      name="session_date"
                      value={sessionData.session_date}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      disabled={saving}
                    />
                    {errors.session_date && (
                      <p className="text-red-500 text-xs mt-1">{errors.session_date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Hora</label>
                    <CustomDropdown
                      value={sessionData.session_time}
                      options={generateTimeSlotsLocal().map(slot => ({ value: slot.value, label: slot.display }))}
                      onChange={val => handleChange({ target: { name: 'session_time', value: val } })}
                      disabled={saving}
                      placeholder="Hora"
                    />
                    {errors.session_time && (
                      <p className="text-red-500 text-xs mt-1">{errors.session_time}</p>
                    )}
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
                    {errors.session_fee && (
                      <p className="text-red-500 text-xs mt-1">{errors.session_fee}</p>
                    )}
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
                        { value: 'completed', label: 'Realizada' },
                        { value: 'cancelled', label: 'Cancelada' }
                      ]}
                      onChange={val => handleChange({ target: { name: 'status', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar estado"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Estado de Pagamento</label>
                    <CustomDropdown
                      value={sessionData.payment_status}
                      options={[
                        { value: 'paid', label: 'Pago' },
                        { value: 'to pay', label: 'Não Pago' },
                        { value: 'invoice issued', label: 'Fatura Emitida' }
                      ]}
                      onChange={val => handleChange({ target: { name: 'payment_status', value: val } })}
                      disabled={saving}
                      placeholder="Selecionar pagamento"
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

                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    Apagar
                  </Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setCurrentMode('view')} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'A guardar...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Apagar Sessão
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem a certeza que pretende apagar esta sessão?<br /><br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteSession}
                disabled={saving}
              >
                {saving ? 'A apagar...' : 'Apagar Definitivamente'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 