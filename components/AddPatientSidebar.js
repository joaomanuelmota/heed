'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Save, User, Mail, Phone, Calendar, MapPin, Check, ChevronDown, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from './Button'

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
          {/* <Check className="w-5 h-5 mr-2 text-gray-400" /> */}
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
              {/* {value === opt.value ? (
                <Check className="w-4 h-4 mr-2 text-blue-600" />
              ) : (
                <span className="w-6 mr-2" />
              )} */}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AddPatientSidebar({ isOpen, onClose, onSuccess, user, mode = 'add', existingPatient = null }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dateInputType, setDateInputType] = useState('text')

  const [patientData, setPatientData] = useState({
    firstName: existingPatient?.firstName || '',
    lastName: existingPatient?.lastName || '',
    dateOfBirth: existingPatient?.dateOfBirth || '',
    vatNumber: existingPatient?.vatNumber || '',
    address: existingPatient?.address || '',
    email: existingPatient?.email || '',
    phone: existingPatient?.phone || '',
    status: existingPatient?.status || 'active',
    sessionType: existingPatient?.session_type || 'on-site'
  })

  useEffect(() => {
    if (mode === 'edit' && existingPatient) {
      setPatientData({
        firstName: existingPatient.firstName || '',
        lastName: existingPatient.lastName || '',
        dateOfBirth: existingPatient.dateOfBirth || '',
        vatNumber: existingPatient.vatNumber || '',
        address: existingPatient.address || '',
        email: existingPatient.email || '',
        phone: existingPatient.phone || '',
        status: existingPatient.status || 'active',
        sessionType: existingPatient.session_type || 'on-site'
      })
    } else if (mode === 'add') {
      setPatientData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        vatNumber: '',
        address: '',
        email: '',
        phone: '',
        status: 'active',
        sessionType: 'on-site'
      })
    }
    setMessage('')
  }, [mode, existingPatient])

  const handleChange = (e) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const submitData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email || null,
        phone: patientData.phone || null,
        dateOfBirth: patientData.dateOfBirth || null,
        vatNumber: patientData.vatNumber || null,
        address: patientData.address || null,
        status: patientData.status,
        session_type: patientData.sessionType,
        updated_at: new Date().toISOString()
      }

      let result;
      if (mode === 'edit') {
        // Update existing patient
        result = await supabase
          .from('patients')
          .update(submitData)
          .eq('id', existingPatient.id)
          .eq('psychologist_id', user.id)
      } else {
        // Create new patient
        submitData.psychologist_id = user.id
        submitData.created_at = new Date().toISOString()
        result = await supabase
          .from('patients')
          .insert([submitData])
      }

      if (result.error) {
        setMessage(`Error: ${result.error.message}`)
      } else {
        setMessage(mode === 'edit' ? 'Paciente atualizado com sucesso!' : 'Paciente adicionado com sucesso!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setLoading(false)
  }

  const handleClose = () => {
    setMessage('')
    setShowDeleteConfirm(false)
    setPatientData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      vatNumber: '',
      address: '',
      email: '',
      phone: '',
      status: 'active',
      sessionType: 'on-site'
    })
    onClose()
  }

  const handleDeletePatient = async () => {
    if (!existingPatient) return
    
    setLoading(true)
    setMessage('')

    try {
      // Primeiro, apagar todas as notas do paciente
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('patient_id', existingPatient.id)
        .eq('psychologist_id', user.id)

      if (notesError) {
        console.error('Error deleting notes:', notesError)
      }

      // Depois, apagar todas as sessões do paciente
      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('patient_id', existingPatient.id)
        .eq('psychologist_id', user.id)

      if (sessionsError) {
        console.error('Error deleting sessions:', sessionsError)
      }

      // Depois, apagar todos os treatment plans do paciente
      const { error: treatmentPlansError } = await supabase
        .from('treatment_plans')
        .delete()
        .eq('patient_id', existingPatient.id)
        .eq('psychologist_id', user.id)

      if (treatmentPlansError) {
        console.error('Error deleting treatment plans:', treatmentPlansError)
      }

      // Finalmente, apagar o paciente
      const { error: patientError } = await supabase
        .from('patients')
        .delete()
        .eq('id', existingPatient.id)
        .eq('psychologist_id', user.id)

      if (patientError) {
        setMessage(`Erro ao apagar paciente: ${patientError.message}`)
      } else {
        setMessage('Paciente apagado com sucesso!')
        setTimeout(() => {
          onSuccess(true) // Passar true para indicar que foi apagado
        }, 1000)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }

    setLoading(false)
    setShowDeleteConfirm(false)
  }

  return (
    <div 
      className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 overflow-y-auto"
      style={{ 
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)', 
        transition: 'transform 300ms ease-in-out' 
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informação Básica
            </h3>
            
            <div className="space-y-4">
              <div>
                <input type="text" name="firstName" value={patientData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" required disabled={loading} placeholder="Nome *" />
              </div>
              <div>
                <input type="text" name="lastName" value={patientData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" required disabled={loading} placeholder="Apelido *" />
              </div>
              <div>
                <input
                  type={dateInputType}
                  name="dateOfBirth"
                  value={patientData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
                  disabled={loading}
                  placeholder="Data de Nascimento"
                  onFocus={() => setDateInputType('date')}
                  onBlur={e => { if (!e.target.value) setDateInputType('text') }}
                />
              </div>
              <div>
                <input 
                  type="text" 
                  name="vatNumber" 
                  value={patientData.vatNumber} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" 
                  disabled={loading} 
                  placeholder="Número de contribuinte" 
                />
              </div>
              <div>
                <input type="text" name="address" value={patientData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Morada" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informação de Contacto
            </h3>
            <div className="space-y-4">
              <div>
                <input type="email" name="email" value={patientData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Endereço de Email" />
              </div>
              <div>
                <input type="tel" name="phone" value={patientData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Número de Telefone" />
              </div>
            </div>
          </div>

          {/* Session Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preferências de Sessão
            </h3>
            <div className="space-y-4">
              {mode === 'edit' && (
                <div>
                  <CustomDropdown
                    value={patientData.status}
                    options={[
                      { value: 'active', label: 'Ativo' },
                      { value: 'inactive', label: 'Inativo' }
                    ]}
                    onChange={val => setPatientData({ ...patientData, status: val })}
                    disabled={loading}
                    placeholder="Estado"
                  />
                </div>
              )}
              <div>
                <CustomDropdown
                  value={patientData.sessionType}
                  options={[
                    { value: 'on-site', label: 'Presencial' },
                    { value: 'remote', label: 'Remoto' },
                    { value: 'hybrid', label: 'Híbrido' }
                  ]}
                  onChange={val => setPatientData({ ...patientData, sessionType: val })}
                  disabled={loading}
                  placeholder="Tipo de Sessão"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 justify-between items-center">
            {mode === 'edit' && (
              <Button 
                type="button" 
                variant="danger" 
                onClick={() => setShowDeleteConfirm(true)} 
                disabled={loading}
              >
                Apagar
              </Button>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)' }}>
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Apagar Paciente
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Tem a certeza que pretende apagar o paciente <strong>{existingPatient?.firstName} {existingPatient?.lastName}</strong>?
                  <br /><br />
                  Esta ação irá apagar permanentemente:
                  <br />• Todas as notas clínicas
                  <br />• Todas as sessões
                  <br />• Todos os planos de tratamento
                  <br />• Todos os dados do paciente
                  <br /><br />
                  <strong>Esta ação não pode ser desfeita.</strong>
                </p>

                <div className="flex gap-3 justify-end">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    variant="danger" 
                    onClick={handleDeletePatient}
                    disabled={loading}
                  >
                    {loading ? 'A apagar...' : 'Apagar Definitivamente'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
} 