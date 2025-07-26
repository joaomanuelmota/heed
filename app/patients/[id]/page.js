'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { formatDateLong, formatDateMonthShort, formatDate as formatDateUtil } from '../../../lib/dateUtils'
import { 
  User, Mail, Phone, FileText, CreditCard, 
  MapPin, Calendar, Clock, Edit, ChevronRight, ChevronDown, ChevronUp,
  Activity, AlertCircle, CheckCircle, Plus,
  Heart, Brain, Stethoscope, Search, Bell,
  Share, MoreHorizontal, Camera, Video,
  MessageCircle, Shield, Star, Users, Timer,
  Bold, Italic, List, ListOrdered, Save, Type, Trash2
} from 'lucide-react'
import ScheduleSessionSidebar from '../../../components/ScheduleSessionSidebar'
import AddPatientSidebar from '../../../components/AddPatientSidebar'
import dynamic from 'next/dynamic'
import ReactDOM from 'react-dom'
import Button from '../../../components/Button'
import SessionDetailsSidebar from '../../../components/SessionDetailsSidebar'
import CustomDropdown from '../../../components/CustomDropdown'
import ContentSection from '../../../components/ContentSection'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const RichTextEditorLazy = dynamic(() => import('../../../components/RichTextEditor'), { ssr: false, loading: () => <div className="p-4 text-gray-400">Carregando editor...</div> })

export default function PatientProfile() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('notes')
  
  const [showScheduleSidebar, setShowScheduleSidebar] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  

  
  // Adicionar estados para edição do status
  const [editingStatusId, setEditingStatusId] = useState(null);
  const statusOptions = [
    { value: 'to pay', label: 'Não Pago' },
    { value: 'paid', label: 'Pago' },
    { value: 'invoice issued', label: 'Fatura Emitida' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  // Novo estado para coordenadas do dropdown
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const badgeRefs = useRef({});

  // Adicionar estados no PatientProfile
  const [showEditSessionSidebar, setShowEditSessionSidebar] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()

  const paymentStatusOptions = [
    { value: 'paid', label: 'Pago' },
    { value: 'to pay', label: 'Não Pago' },
    { value: 'invoice issued', label: 'Fatura Emitida' }
  ];



  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  // React Query - Buscar dados do paciente
  const {
    data: patient,
    isLoading: loadingPatient,
    error: patientError
  } = useQuery({
    queryKey: ['patient', user?.id, params.id],
    queryFn: async () => {
      if (!user?.id || !params.id) return null;
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .eq('psychologist_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Patient not found or you do not have permission to view this patient.')
        } else {
          throw new Error(`Error fetching patient: ${error.message}`)
        }
      }
      return data
    },
    enabled: !!user?.id && !!params.id
  })



  // React Query - Buscar sessões do paciente
  const {
    data: sessions = [],
    isLoading: loadingSessions
  } = useQuery({
    queryKey: ['sessions', user?.id, params.id],
    queryFn: async () => {
      if (!user?.id || !params.id) return [];
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', params.id)
        .eq('psychologist_id', user.id)
        .order('session_date', { ascending: false })

      if (error) {
        console.error('Error fetching sessions:', error)
        return []
      }
      return data || []
    },
    enabled: !!user?.id && !!params.id
  })



  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown'
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    return formatDateLong(dateString)
  }

  // React Query Mutations


  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updateData }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('psychologist_id', user.id)

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id, params.id] })
    }
  })

  const getStatusBadge = (status) => {
    let badgeClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border cursor-pointer transition-all duration-150 group relative";
    let colorClass = "";
    if (status === 'paid') {
      colorClass = "bg-green-100 text-green-800 border-green-200 group-hover:bg-green-200 group-hover:shadow";
    } else if (status === 'cancelled') {
      colorClass = "bg-red-100 text-red-800 border-red-200 group-hover:bg-red-200 group-hover:shadow";
    } else if (status === 'invoice issued') {
      colorClass = "bg-blue-100 text-blue-800 border-blue-200 group-hover:bg-blue-200 group-hover:shadow";
    } else if (status === 'to pay') {
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 group-hover:bg-gray-200 group-hover:shadow";
    } else {
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 group-hover:bg-gray-200 group-hover:shadow";
    }
    return (
      <span className={`${badgeClass} ${colorClass}`} tabIndex={0}>
        {status === 'invoice issued' ? 'Fatura Emitida' : status === 'to pay' ? 'Não Pago' : status === 'paid' ? 'Pago' : status === 'cancelled' ? 'Cancelado' : 'Não Pago'}
        <span className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mb-1" />
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mt-1" />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-30">Clique para editar o estado</span>
      </span>
    );
  }

  const handleStatusChange = async (sessionId, newStatus) => {
    await updateSessionMutation.mutateAsync({
      sessionId,
      updateData: { payment_status: newStatus, updated_at: new Date().toISOString() }
    });
  };

  const handlePaymentStatusChange = async (sessionId, newPaymentStatus) => {
    await updateSessionMutation.mutateAsync({
      sessionId,
      updateData: { payment_status: newPaymentStatus, updated_at: new Date().toISOString() }
    });
  }

  // Adicionar função para atualizar o status da sessão
  const handleSessionStatusChange = async (sessionId, newStatus) => {
    let paymentStatusUpdate = {}
    if (newStatus === 'cancelled') {
      paymentStatusUpdate = { payment_status: 'to pay' }
    }
    await updateSessionMutation.mutateAsync({
      sessionId,
      updateData: { status: newStatus, updated_at: new Date().toISOString(), ...paymentStatusUpdate }
    });
  }



  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
      inactive: { label: 'Inativo', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
      'on-hold': { label: 'Em Espera', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' }
    }
    return statusConfig[status] || statusConfig.active
  }

  const getSessionTypeDisplay = (type) => {
    const typeConfig = {
      remote: { label: 'Remoto', color: 'bg-blue-100 text-blue-700', icon: Video },
      'on-site': { label: 'Presencial', color: 'bg-purple-100 text-purple-700', icon: Users },
      hybrid: { label: 'Híbrido', color: 'bg-orange-100 text-orange-700', icon: Share }
    }
    return typeConfig[type] || typeConfig.remote
  }

  const tabs = [
    { id: 'notes', label: 'Notas Clínicas', icon: FileText },
    { id: 'treatment', label: 'Plano Terapêutico', icon: Brain },
    { id: 'payments', label: 'Sessões', icon: Calendar },
    { id: 'info', label: 'Informação', icon: User }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <ContentSection
            type="notes"
            title="Nota Clínica"
            icon={FileText}
            patientId={patient.id}
            userId={user.id}
            placeholder="Escreva aqui as suas notas clínicas..."
            buttonText="Nova"
            validationMessage="Escreve um título para a nota."
          />
        )
      case 'treatment':
        return (
          <ContentSection
            type="treatment_plans"
            title="Plano Terapêutico"
            icon={Brain}
            patientId={patient.id}
            userId={user.id}
            placeholder="Descreva o plano terapêutico, objetivos, métodos, cronograma..."
            buttonText="Adicionar"
            validationMessage="Escreve um título para o plano."
          />
        )
      case 'payments':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-end items-center">
              <div className="text-sm text-gray-500">
                {sessions.length} sessões no total
              </div>
            </div>

            {/* Sessions Table */}
            {loadingSessions ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">A carregar sessões...</p>
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma sessão encontrada para este paciente.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sessões
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado da Sessão
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado de Pagamento
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {session.title || 'Sessão'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(session.session_date)}
                            </div>
                            {session.session_time && (
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const start = session.session_time.slice(0,5)
                                  let [h, m] = start.split(":").map(Number)
                                  const endDate = new Date(0,0,0,h,m)
                                  endDate.setMinutes(endDate.getMinutes() + (session.duration_minutes || 60))
                                  const end = endDate.toTimeString().slice(0,5)
                                  return `${start} - ${end} (${session.duration_minutes || 60} min)`
                                })()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            <div className="text-right">
                              €{session.session_fee || '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CustomDropdown
                              value={session.status}
                              options={[
                                { value: 'scheduled', label: 'Agendada' },
                                { value: 'completed', label: 'Realizada' },
                                { value: 'cancelled', label: 'Cancelada' }
                              ]}
                              onChange={async (newStatus) => {
                                await handleSessionStatusChange(session.id, newStatus)
                              }}
                              placeholder="Estado da Sessão"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CustomDropdown
                              value={session.payment_status}
                              options={paymentStatusOptions}
                              onChange={async (newStatus) => { await handlePaymentStatusChange(session.id, newStatus) }}
                              placeholder="Estado"
                              disabled={session.status === 'cancelled'}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => {
                                setSelectedSessionId(session.id);
                                setShowEditSessionSidebar(true);
                              }}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar sessão"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      case 'info':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <span className="block text-gray-500 text-sm">Email</span>
                <span className="block text-gray-900">{patient.email || 'Não fornecido'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">NIF</span>
                <span className="block text-gray-900">{patient.vatNumber || 'Não fornecido'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Telefone</span>
                <span className="block text-gray-900">{patient.phone || 'Não fornecido'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Estado</span>
                <span className="block text-gray-900">{statusConfig.label}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Data de Nascimento</span>
                <span className="block text-gray-900">{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Não fornecida'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Morada</span>
                <span className="block text-gray-900">{patient.address || 'Não fornecida'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Tipo de Sessão</span>
                <span className="block text-gray-900">{sessionTypeConfig.label}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Especialidade</span>
                <span className="block text-gray-900">{patient.specialty || 'Não especificada'}</span>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (patientError) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{patientError.message}</p>
          <Link href="/patients" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  if (!patient) return null

  const statusConfig = getStatusDisplay(patient.status)
  const sessionTypeConfig = getSessionTypeDisplay(patient.session_type)
  const SessionIcon = sessionTypeConfig.icon

  // Generic data for missing information
  const genericData = {
    nextSession: "July 15, 2024",
    lastSession: "3 days ago",
    totalSessions: "12",
    vatNumber: `VAT${patient.id.toString().slice(-6)}`
  }

  // Find next session (future, scheduled)
  const nextSession = Array.isArray(sessions)
    ? sessions
        .filter(s => s.status === 'scheduled' && new Date(`${s.session_date}T${s.session_time}`) > new Date())
        .sort((a, b) => new Date(`${a.session_date}T${a.session_time}`) - new Date(`${b.session_date}T${b.session_time}`))[0]
    : null;

  // Funções de validação
  function validarTitulo(titulo) {
    return titulo && titulo.trim().length > 0
  }

  // Função para invalidar todas as queries relacionadas ao paciente
  const invalidatePatientQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['patient', user?.id, params.id] })
    
    queryClient.invalidateQueries({ queryKey: ['sessions', user?.id, params.id] })

  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
              <span className={`inline-flex items-center px-3 py-1 ml-2 rounded-full text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
            <div className="text-gray-600 mt-1 text-sm">
              <span className="font-medium">Próxima Sessão:</span> {nextSession ? `${formatDate(nextSession.session_date)} às ${nextSession.session_time.slice(0,5)}` : 'Nenhuma sessão agendada'}
            </div>
            <div className="text-gray-600 text-sm">
              <span className="font-medium">Sessões Realizadas:</span> {Array.isArray(sessions) ? sessions.filter(s => s.status === 'completed').length : 0}
            </div>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setEditingPatient(patient)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Editar
            </button>
            <Button
              onClick={() => setShowScheduleSidebar(true)}
              className="px-4 py-2 rounded-lg font-medium"
            >
              Agendar Sessão
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-100" style={{ overflow: 'visible' }}>
          <div className="border-b border-gray-100 flex gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all text-sm ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
          <div className="p-6" style={{ overflow: 'visible' }}>
            {renderTabContent()}
          </div>
        </div>

        {/* Sidebars */}
        <ScheduleSessionSidebar 
          isOpen={showScheduleSidebar}
          onClose={() => setShowScheduleSidebar(false)}
          onSuccess={() => {
            setShowScheduleSidebar(false)
            queryClient.invalidateQueries({ queryKey: ['sessions', user?.id, params.id] })
          }}
          user={user}
          patients={[patient]}
          preSelectedPatient={patient.id}
        />
        <AddPatientSidebar
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={(deleted = false) => {
            console.log('PatientProfile: onSuccess called, deleted:', deleted);
            setEditingPatient(null)
            if (deleted) {
              router.push('/patients')
            } else {
              // Invalidar todas as queries relacionadas ao paciente
              console.log('PatientProfile: Invalidating patient queries...');
              queryClient.invalidateQueries({ queryKey: ['patient', user?.id, params.id] })
        
              queryClient.invalidateQueries({ queryKey: ['sessions', user?.id, params.id] })
        
            }
          }}
          user={user}
          mode="edit"
          existingPatient={editingPatient}
        />
        <SessionDetailsSidebar
          isOpen={showEditSessionSidebar}
          onClose={() => setShowEditSessionSidebar(false)}
          onSuccess={() => {
            setShowEditSessionSidebar(false);
            queryClient.invalidateQueries({ queryKey: ['sessions', user?.id, params.id] });
          }}
          user={user}
          patients={[patient]}
          sessionId={selectedSessionId}
          mode="edit"
        />
      </div>
    </div>
  )
}