'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Save, User, Mail, Phone, Calendar, MapPin, Check, ChevronDown, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from './Button'
import CustomDropdown from './CustomDropdown'
import { validarEmail, validarTelefone, validarData } from '../lib/dateUtils'
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AddPatientSidebar(props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dateInputType, setDateInputType] = useState('text')
  const [errors, setErrors] = useState({})

  const [patientData, setPatientData] = useState({
    firstName: props.existingPatient?.firstName || '',
    lastName: props.existingPatient?.lastName || '',
    dateOfBirth: props.existingPatient?.dateOfBirth || '',
    vatNumber: props.existingPatient?.vatNumber || '',
    address: props.existingPatient?.address || '',
    email: props.existingPatient?.email || '',
    phone: props.existingPatient?.phone || '',
    status: props.existingPatient?.status || 'active',
    sessionType: props.existingPatient?.session_type || 'on-site'
  })

  const queryClient = useQueryClient();

  // Mutations React Query
  const addOrEditPatientMutation = useMutation({
    mutationFn: async (submitData) => {
      if (props.mode === 'edit') {
        return await supabase
          .from('patients')
          .update(submitData)
          .eq('id', props.existingPatient.id)
          .eq('psychologist_id', props.user.id)
      } else {
        submitData.psychologist_id = props.user.id
        submitData.created_at = new Date().toISOString()
        return await supabase
          .from('patients')
          .insert([submitData])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', props.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['sessions', props.user?.id] });
    }
  });

  const deletePatientMutation = useMutation({
    mutationFn: async () => {
      // Primeiro, apagar todas as notas do paciente
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('patient_id', props.existingPatient.id)
        .eq('psychologist_id', props.user.id)

      if (notesError) {
        console.error('Error deleting notes:', notesError)
      }

      // Depois, apagar todas as sessões do paciente
      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('patient_id', props.existingPatient.id)
        .eq('psychologist_id', props.user.id)

      if (sessionsError) {
        console.error('Error deleting sessions:', sessionsError)
      }

      // Depois, apagar todos os treatment plans do paciente
      const { error: treatmentPlansError } = await supabase
        .from('treatment_plans')
        .delete()
        .eq('patient_id', props.existingPatient.id)
        .eq('psychologist_id', props.user.id)

      if (treatmentPlansError) {
        console.error('Error deleting treatment plans:', treatmentPlansError)
      }

      // Finalmente, apagar o paciente
      const { error: patientError } = await supabase
        .from('patients')
        .delete()
        .eq('id', props.existingPatient.id)
        .eq('psychologist_id', props.user.id)

      if (patientError) {
        setMessage(`Erro ao apagar paciente: ${patientError.message}`)
      } else {
        setMessage('Paciente apagado com sucesso!')
        setTimeout(() => {
          props.onSuccess(true) // Passar true para indicar que foi apagado
        }, 1000)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', props.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['sessions', props.user?.id] });
    }
  });

  useEffect(() => {
    if (props.mode === 'edit' && props.existingPatient) {
      setPatientData({
        firstName: props.existingPatient.firstName || '',
        lastName: props.existingPatient.lastName || '',
        dateOfBirth: props.existingPatient.dateOfBirth || '',
        vatNumber: props.existingPatient.vatNumber || '',
        address: props.existingPatient.address || '',
        email: props.existingPatient.email || '',
        phone: props.existingPatient.phone || '',
        status: props.existingPatient.status || 'active',
        sessionType: props.existingPatient.session_type || 'on-site'
      })
    } else if (props.mode === 'add') {
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
    setErrors({})
  }, [props.mode, props.existingPatient])

  const validate = () => {
    const newErrors = {}
    if (!patientData.firstName.trim()) newErrors.firstName = 'Por favor, insira o nome.'
    if (!patientData.lastName.trim()) newErrors.lastName = 'Por favor, insira o apelido.'
    if (!validarEmail(patientData.email)) newErrors.email = 'Por favor, insira um email válido.'
    if (!validarTelefone(patientData.phone)) newErrors.phone = 'Por favor, insira um telefone válido.'
    if (!validarData(patientData.dateOfBirth)) newErrors.dateOfBirth = 'Por favor, insira uma data válida.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value
    })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!validate()) return
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

      await addOrEditPatientMutation.mutateAsync(submitData)

    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
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
    props.onClose()
  }

  const handleDeletePatient = async () => {
    if (!props.existingPatient) return
    
    setLoading(true)
    setMessage('')

    try {
      await deletePatientMutation.mutateAsync()
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
        transform: props.isOpen ? 'translateX(0)' : 'translateX(100%)', 
        transition: 'transform 300ms ease-in-out' 
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {props.mode === 'edit' ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
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
          <div className={`p-4 rounded-lg text-sm border ${message.toLowerCase().includes('sucesso') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
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
                <label htmlFor="patient-firstName" className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" id="patient-firstName" name="firstName" value={patientData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" required disabled={loading} placeholder="Nome *" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="patient-lastName" className="block text-sm font-medium text-gray-700">Apelido</label>
                <input type="text" id="patient-lastName" name="lastName" value={patientData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" required disabled={loading} placeholder="Apelido *" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label htmlFor="patient-dateOfBirth" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <input type={dateInputType} id="patient-dateOfBirth" name="dateOfBirth" value={patientData.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400" disabled={loading} placeholder="Data de Nascimento" onFocus={() => setDateInputType('date')} onBlur={e => { if (!e.target.value) setDateInputType('text') }} />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <label htmlFor="patient-vatNumber" className="block text-sm font-medium text-gray-700">Número de Contribuinte</label>
                <input 
                  type="text" 
                  id="patient-vatNumber"
                  name="vatNumber" 
                  value={patientData.vatNumber} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" 
                  disabled={loading} 
                  placeholder="Número de contribuinte" 
                />
              </div>
              <div>
                <label htmlFor="patient-address" className="block text-sm font-medium text-gray-700">Morada</label>
                <input 
                  type="text" 
                  id="patient-address"
                  name="address" 
                  value={patientData.address} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" 
                  disabled={loading} 
                  placeholder="Morada" 
                />
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
                <label htmlFor="patient-email" className="block text-sm font-medium text-gray-700">Endereço de Email</label>
                <input type="email" id="patient-email" name="email" value={patientData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Endereço de Email" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="patient-phone" className="block text-sm font-medium text-gray-700">Número de Telefone</label>
                <input type="tel" id="patient-phone" name="phone" value={patientData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Número de Telefone" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Session Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preferências de Sessão
            </h3>
            <div className="space-y-4">
              {props.mode === 'edit' && (
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
            {props.mode === 'edit' && (
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
                  Tem a certeza que pretende apagar o paciente <strong>{props.existingPatient?.firstName} {props.existingPatient?.lastName}</strong>?
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