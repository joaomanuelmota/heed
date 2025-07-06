'use client'
// Dashboard page with sidebar integration
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/dateUtils'
import { CalendarDays, Euro, Users, Clock, Plus, FileText, ChevronDown, ChevronUp } from "lucide-react"
import AddPatientSidebar from '../../components/AddPatientSidebar'
import ScheduleSessionSidebar from '../../components/ScheduleSessionSidebar'
import Button from '../../components/Button'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: googleSession, status } = useSession()
  const router = useRouter()
  const [today, setToday] = useState(new Date())
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showScheduleSession, setShowScheduleSession] = useState(false)
  const [editingStatusIdUnpaidSessions, setEditingStatusIdUnpaidSessions] = useState(null)

  useEffect(() => {
    checkUser()
    setToday(new Date())
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        fetchPatients(user.id)
        fetchSessions(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
    setLoading(false)
  }

  const fetchPatients = async (psychologistId) => {
    try {
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false })
      if (!patientsError && patientsData) {
        setPatients(patientsData)
      } else {
        setPatients([])
      }
    } catch (error) {
      setPatients([])
    }
  }

  const fetchSessions = async (psychologistId) => {
    setLoading(true)
    try {
      // Buscar todas as sessões do psicólogo
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('session_date', { ascending: false })

      if (sessionsError) {
        setSessions([])
        setLoading(false)
        return
      }

      if (sessionsData && sessionsData.length > 0) {
        // Buscar os pacientes associados
        const patientIds = [...new Set(sessionsData.map(session => session.patient_id))]
        let patientsData = []
        if (patientIds.length > 0) {
          const { data: patients, error: patientsError } = await supabase
            .from('patients')
            .select('id, firstName, lastName')
            .in('id', patientIds)
          if (!patientsError) {
            patientsData = patients
          }
        }
        // Merge manual dos dados do paciente
        const sessionsWithPatients = sessionsData.map(session => {
          const patient = patientsData.find(p => p.id === session.patient_id)
          return {
            ...session,
            patients: patient || { firstName: 'Unknown', lastName: 'Patient' }
          }
        })
        setSessions(sessionsWithPatients)
      } else {
        setSessions([])
      }
    } catch (error) {
      setSessions([])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      // Sign out from both Supabase and Google
      await supabase.auth.signOut()
      if (googleSession) {
        await signOut({ redirect: false })
      }
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleGoogleConnect = () => {
    signIn('google')
  }

  const handleGoogleDisconnect = () => {
    signOut({ redirect: false })
  }

  const getRecentPatients = () => {
    return patients.slice(0, 3) // Show last 3 patients
  }

  // Calculate dashboard metrics
  const getSessionsToday = () => {
    const todayStr = today.toISOString().split('T')[0]
    return sessions.filter(session => 
      session.session_date === todayStr
    ).length
  }

  const getUpcomingSessions = () => {
    const todayStr = today.toISOString().split('T')[0]
    return sessions.filter(session => 
      session.session_date > todayStr
    ).length
  }

  const getOutstandingRevenue = () => {
    const todayStr = today.toISOString().split('T')[0]
    const pastUnpaidSessions = sessions.filter(session => 
      session.session_date < todayStr && 
      session.status !== 'paid'
    )
    
    return pastUnpaidSessions.reduce((total, session) => 
      total + (session.session_fee || 0), 0
    )
  }

  const getTodaysSessions = () => {
    const todayStr = today.toISOString().split('T')[0]
    return sessions.filter(session => 
      session.session_date === todayStr
    )
  }

  const getUnpaidSessions = () => {
    const todayStr = today.toISOString().split('T')[0]
    return sessions.filter(session => 
      session.session_date < todayStr && 
      session.status !== 'paid'
    ).sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
  }

  const isPaid = s => s.payment_status === "paid" || s.payment_status === "invoice issued"
  const unpaidSessions = sessions.filter(s => !isPaid(s))

  const statusOptions = [
    { value: "paid", label: "Pago" },
    { value: "to pay", label: "A Pagar" },
    { value: "invoice issued", label: "Fatura Emitida" },
    { value: "cancelled", label: "Cancelado" },
  ]

  const handleStatusChange = async (sessionId, newStatus) => {
    await supabase
      .from("sessions")
      .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, payment_status: newStatus } : s
      )
    )
  }

  function getStatusBadge(status) {
    let badgeClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border cursor-pointer transition-all duration-150 group relative"
    let colorClass = ""
    if (status === 'paid') {
      colorClass = "bg-green-100 text-green-800 border-green-200 group-hover:bg-green-200 group-hover:shadow"
    } else if (status === 'cancelled') {
      colorClass = "bg-red-100 text-red-800 border-red-200 group-hover:bg-red-200 group-hover:shadow"
    } else if (status === 'invoice issued') {
      colorClass = "bg-blue-100 text-blue-800 border-blue-200 group-hover:bg-blue-200 group-hover:shadow"
    } else if (status === 'to pay') {
      colorClass = "bg-gray-100 text-gray-600 border-gray-300 group-hover:bg-gray-200 group-hover:shadow"
    } else {
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 group-hover:bg-gray-200 group-hover:shadow"
    }
    return (
      <span className={`${badgeClass} ${colorClass}`} tabIndex={0}>
        {status === 'invoice issued' ? 'Fatura Emitida' : status === 'to pay' ? 'A Pagar' : status === 'paid' ? 'Pago' : status === 'cancelled' ? 'Cancelado' : 'Não Pago'}
        <span className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mb-1" />
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mt-1" />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-30">Clicar para editar estado</span>
      </span>
    )
  }

  // Format date
  const dateString = formatDate(today.toISOString(), { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 md:gap-0 px-4 md:px-0 pt-6 md:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <div className="text-gray-500 text-sm">Hoje: {dateString}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddPatient(true)} className="flex items-center gap-2">
            <Plus size={18}/> Adicionar Paciente
          </Button>
          <Button onClick={() => setShowScheduleSession(true)} className="flex items-center gap-2">
            <CalendarDays size={18}/> Agendar Sessão
          </Button>
        </div>
      </div>

      {/* Add Patient Sidebar */}
      <AddPatientSidebar
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSuccess={() => { setShowAddPatient(false); fetchSessions(user.id); }}
        user={user}
      />
      {/* Schedule Session Sidebar */}
      <ScheduleSessionSidebar
        isOpen={showScheduleSession}
        onClose={() => setShowScheduleSession(false)}
        onSuccess={() => setShowScheduleSession(false)}
        user={user}
        patients={patients}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4 md:px-0">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <Users className="w-7 h-7 text-blue-600 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Total de Pacientes</div>
          <div className="text-2xl font-bold text-gray-900">{patients.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <Clock className="w-7 h-7 text-green-600 mb-2" />
                      <div className="text-sm text-gray-500 mb-1">Sessões Hoje</div>
          <div className="text-2xl font-bold text-gray-900">{getSessionsToday()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <CalendarDays className="w-7 h-7 text-yellow-600 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Próximas Sessões</div>
          <div className="text-2xl font-bold text-gray-900">{getUpcomingSessions()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <Euro className="w-7 h-7 text-blue-700 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Receita do Mês</div>
          <div className="text-2xl font-bold text-gray-900">€{getOutstandingRevenue().toFixed(2)}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agenda de Hoje</h2>
            {getTodaysSessions().length > 0 ? (
              <div className="space-y-3">
                {getTodaysSessions().map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {patients.find(p => p.id === session.patient_id)?.name || 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-gray-500">{session.session_time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">€{session.session_fee?.toFixed(2) || '0.00'}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'paid' ? 'bg-green-100 text-green-800' :
                        session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Nenhuma sessão agendada para hoje.</div>
            )}
          </div>

          {/* Outstanding Payments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Sessões Não Pagas
            </h2>
            <div className="overflow-visible">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4">Paciente</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4">Data</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600 w-1/4 pr-8">Valor</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4 pl-8">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unpaidSessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-8">Nenhuma sessão não paga 🎉</td>
                    </tr>
                  ) : (
                    unpaidSessions.map(session => (
                      <tr key={session.id}>
                        <td className="px-4 py-2 whitespace-nowrap w-1/4">{session.patients?.firstName || '—'} {session.patients?.lastName || ''}</td>
                        <td className="px-4 py-2 whitespace-nowrap w-1/4">{session.session_date ? formatDate(session.session_date) : '—'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right font-mono w-1/4 pr-8">{typeof session.session_fee === 'number' ? `€${session.session_fee}` : '—'}</td>
                        <td className="px-4 py-2 whitespace-nowrap w-1/4 pl-8">
                          {editingStatusIdUnpaidSessions === session.id ? (
                            <div className="relative">
                              <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded shadow-lg z-50">
                                {statusOptions.map(opt => (
                                  <button
                                    key={opt.value}
                                    className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${session.payment_status === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'}`}
                                    onClick={async () => {
                                      await handleStatusChange(session.id, opt.value)
                                      setEditingStatusIdUnpaidSessions(null)
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span onClick={() => setEditingStatusIdUnpaidSessions(session.id)}>{getStatusBadge(session.payment_status)}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-8">
          {/* Financial Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral Financeira</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Este Mês:</span>
                <span className="text-sm font-medium">€0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Este Ano:</span>
                <span className="text-sm font-medium">€0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pendente:</span>
                <span className="text-sm font-medium text-red-600">€{getOutstandingRevenue().toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* Patient Insights */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights dos Pacientes</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Novos Este Mês:</span>
                <span className="text-sm font-medium">{patients.filter(p => {
                  const created = new Date(p.created_at)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                }).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pacientes Ativos:</span>
                <span className="text-sm font-medium">{patients.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}