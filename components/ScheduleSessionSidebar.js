'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Save, Calendar, Clock, User, FileText, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateTimeSlots, validarNumero } from '../lib/dateUtils'
import Button from './Button'
import CustomDropdown from './CustomDropdown'

export default function ScheduleSessionSidebar(props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dateInputType, setDateInputType] = useState('text')
  const [errors, setErrors] = useState({})

  const [sessionData, setSessionData] = useState({
    patient_id: props.preSelectedPatient || '',
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
    if (props.preSelectedPatient && props.patients.length > 0) {
      setSessionData(prev => ({
        ...prev,
        patient_id: props.preSelectedPatient
      }))
    }
  }, [props.preSelectedPatient, props.patients])

  useEffect(() => {
    if (props.isOpen) {
      setMessage('');
      setErrors({})
    }
  }, [props.isOpen]);

  const validate = () => {
    const newErrors = {}
    if (!sessionData.patient_id) newErrors.patient_id = 'Por favor, selecione um paciente.'
    if (!sessionData.session_date) newErrors.session_date = 'Por favor, selecione a data.'
    if (!sessionData.session_time) newErrors.session_time = 'Por favor, selecione a hora.'
    if (!sessionData.session_fee || !validarNumero(sessionData.session_fee)) newErrors.session_fee = 'Por favor, insira um valor válido para a sessão.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSessionData({
      ...sessionData,
      [name]: value
    })
    setErrors({ ...errors, [name]: '' })
    // Auto-generate title when patient is selected
    if (name === 'patient_id' && value) {
      const selectedPatient = props.patients.find(p => p.id == value)
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
    setMessage('')
    if (!validate()) return
    setLoading(true)
    setMessage('')
    try {
      const submitData = {
        patient_id: parseInt(sessionData.patient_id),
        title: sessionData.title || `Sessão com ${props.patients.find(p => p.id == sessionData.patient_id)?.firstName} ${props.patients.find(p => p.id == sessionData.patient_id)?.lastName}`,
        session_date: sessionData.session_date,
        session_time: sessionData.session_time,
        duration_minutes: parseInt(sessionData.duration_minutes),
        status: sessionData.status,
        payment_status: sessionData.payment_status || 'to pay',
        notes: sessionData.notes || null,
        session_fee: Number(sessionData.session_fee),
        psychologist_id: props.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('sessions')
        .insert([submitData])
      if (error) {
        setMessage(`Erro: ${error.message}`)
      } else {
        setMessage('Sessão agendada com sucesso!')
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
          props.onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
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

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-[60] overflow-y-auto" style={{ transform: props.isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms ease-in-out' }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Agendar Sessão</h2>
          <button onClick={props.onClose} className="p-2 text-gray-400 hover:text-gray-600">
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
          {/* Paciente */}
          <div>
            <label htmlFor="schedule-patient" className="block text-sm font-medium text-gray-700">Paciente</label>
            {props.preSelectedPatient && props.patients.length > 0 ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed">
                {props.patients.find(p => p.id == props.preSelectedPatient)?.firstName} {props.patients.find(p => p.id == props.preSelectedPatient)?.lastName}
              </div>
            ) : (
              <CustomDropdown
                value={sessionData.patient_id}
                options={props.patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
                onChange={val => handleChange({ target: { name: 'patient_id', value: val } })}
                disabled={loading}
                placeholder="Selecione o paciente"
                id="schedule-patient"
              />
            )}
            {errors.patient_id && (
              <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>
            )}
          </div>
          {/* Session Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="schedule-title" className="block text-sm font-medium text-gray-700">Título da Sessão</label>
              <input
                id="schedule-title"
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
                <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700">Data da Sessão</label>
                <input
                  id="schedule-date"
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
                {errors.session_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.session_date}</p>
                )}
              </div>
              <div>
                <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700">Hora</label>
                <CustomDropdown
                  value={sessionData.session_time}
                  options={generateTimeSlotsLocal().map(slot => ({ value: slot.value, label: slot.display }))}
                  onChange={val => handleChange({ target: { name: 'session_time', value: val } })}
                  disabled={loading}
                  placeholder="Hora"
                  id="schedule-time"
                />
                {errors.session_time && (
                  <p className="text-red-500 text-xs mt-1">{errors.session_time}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="schedule-session-fee" className="block text-sm font-medium text-gray-700">Valor da Sessão (€)</label>
                <input
                  id="schedule-session-fee"
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
                {errors.session_fee && (
                  <p className="text-red-500 text-xs mt-1">{errors.session_fee}</p>
                )}
              </div>
              <div>
                <label htmlFor="schedule-duration" className="block text-sm font-medium text-gray-700">Duração</label>
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
                  placeholder="Duração"
                  id="schedule-duration"
                />
              </div>
            </div>
            <div>
              <label htmlFor="schedule-notes" className="block text-sm font-medium text-gray-700">Notas da Sessão</label>
              <textarea
                id="schedule-notes"
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
            <Button type="button" variant="secondary" onClick={props.onClose} disabled={loading}>
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