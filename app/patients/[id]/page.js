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

const RichTextEditorLazy = dynamic(() => import('../../../components/RichTextEditor'), { ssr: false, loading: () => <div className="p-4 text-gray-400">Carregando editor...</div> })

export default function PatientProfile() {
  const [user, setUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  
  // Estados para notas
  const [showAddNote, setShowAddNote] = useState(false)
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    note_date: new Date().toISOString().split('T')[0]
  })

  // Estados para payments/sessions
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // Estados para edição de notas
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteData, setEditNoteData] = useState({
    title: '',
    content: '',
    note_date: ''
  })
  const [showScheduleSidebar, setShowScheduleSidebar] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  
  // Estados para treatment plans  
  const [showAddTreatmentPlan, setShowAddTreatmentPlan] = useState(false)
  const [treatmentPlans, setTreatmentPlans] = useState([])
  const [treatmentPlansLoading, setTreatmentPlansLoading] = useState(false)
  const [treatmentPlanData, setTreatmentPlanData] = useState({
    title: '',
    content: '',
    plan_date: new Date().toISOString().split('T')[0]
  })

  // Estados para edição de treatment plans
  const [editingTreatmentPlanId, setEditingTreatmentPlanId] = useState(null)
  const [editTreatmentPlanData, setEditTreatmentPlanData] = useState({
    title: '',
    content: '',
    plan_date: ''
  })
  
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

  const paymentStatusOptions = [
    { value: 'paid', label: 'Pago' },
    { value: 'to pay', label: 'Não Pago' },
    { value: 'invoice issued', label: 'Fatura Emitida' }
  ];

  const [triedSaveNote, setTriedSaveNote] = useState(false);
  const [triedSaveTreatmentPlan, setTriedSaveTreatmentPlan] = useState(false);

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        fetchPatient(user.id, params.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  const fetchPatient = async (psychologistId, patientId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('psychologist_id', psychologistId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Patient not found or you do not have permission to view this patient.')
        } else {
          setError(`Error fetching patient: ${error.message}`)
        }
      } else {
        setPatient(data)
      }
    } catch (error) {
      setError(`Unexpected error: ${error.message}`)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    if (patient && user) {
      fetchNotes(patient.id)
      fetchSessions(patient.id)
      fetchTreatmentPlans(patient.id)
    }
  }, [patient, user])

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

  const fetchNotes = async (patientId) => {
    if (!user) {
      return
    }
    
    setNotesLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', user.id)
        .order('note_date', { ascending: false })

      if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data || [])
      }
    } catch (error) {
      console.error('Unexpected error fetching notes:', error)
    }
    setNotesLoading(false)
  }

  const fetchTreatmentPlans = async (patientId) => {
    if (!user) {
      return
    }
    
    setTreatmentPlansLoading(true)
    try {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', user.id)
        .order('plan_date', { ascending: false })

      if (error) {
        console.error('Error fetching treatment plans:', error)
      } else {
        setTreatmentPlans(data || [])
      }
    } catch (error) {
      console.error('Unexpected error fetching treatment plans:', error)
    }
    setTreatmentPlansLoading(false)
  }

  const fetchSessions = async (patientId) => {
    if (!user) return
    
    setSessionsLoading(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', user.id)
        .order('session_date', { ascending: false })

      if (error) {
        console.error('Error fetching sessions:', error)
      } else {
        setSessions(data || [])
      }
    } catch (error) {
      console.error('Unexpected error fetching sessions:', error)
    }
    setSessionsLoading(false)
  }

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
    await supabase
      .from('sessions')
      .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, payment_status: newStatus } : s
      )
    );
  };

  const handlePaymentStatusChange = async (sessionId, newPaymentStatus) => {
    await supabase
      .from('sessions')
      .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, payment_status: newPaymentStatus } : s
      )
    )
  }

  // Adicionar função para atualizar o status da sessão
  const handleSessionStatusChange = async (sessionId, newStatus) => {
    let paymentStatusUpdate = {}
    if (newStatus === 'cancelled') {
      paymentStatusUpdate = { payment_status: 'to pay' }
    }
    await supabase
      .from('sessions')
      .update({ status: newStatus, updated_at: new Date().toISOString(), ...paymentStatusUpdate })
      .eq('id', sessionId)
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: newStatus, ...(newStatus === 'cancelled' ? { payment_status: 'to pay' } : {}) }
          : s
      )
    )
  }

  const saveNote = async () => {
    if (!noteData.title.trim()) {
      alert('Por favor, insira um título para a nota.')
      return
    }
    
    if (!patient) {
      alert('Informações do paciente não disponíveis')
      return
    }

    try {
      const newNote = {
        psychologist_id: user.id,
        patient_id: patient.id,
        title: noteData.title.trim(),
        content: noteData.content || '',
        note_date: noteData.note_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()

      if (error) {
        console.error('Erro ao salvar nota:', error)
      } else {
        // Adicionar a nova nota à lista
        setNotes([data[0], ...notes])
        
        // Limpar formulário
        setNoteData({
          title: '',
          content: '',
          note_date: new Date().toISOString().split('T')[0]
        })
        
        // Fechar formulário
        setShowAddNote(false)
        setTriedSaveNote(false);
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao salvar nota')
    }
  }

  const deleteNote = async (noteId) => {
    if (!confirm('Tem certeza de que deseja excluir esta nota? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('psychologist_id', user.id)

      if (error) {
        console.error('Erro ao excluir nota:', error)
        alert('Erro ao excluir nota: ' + error.message)
      } else {
        // Remove a nota da lista local
        setNotes(notes.filter(note => note.id !== noteId))
        alert('Nota excluída com sucesso!')
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao excluir nota')
    }
  }

  const startEditNote = (note) => {
    setEditingNoteId(note.id)
    setEditNoteData({
      title: note.title,
      content: note.content || '',
      note_date: note.note_date
    })
  }

  const cancelEditNote = () => {
    setEditingNoteId(null)
    setEditNoteData({
      title: '',
      content: '',
      note_date: ''
    })
  }

  const saveEditNote = async (noteId) => {
    if (!editNoteData.title.trim()) {
      alert('Por favor, insira um título para a nota.')
      return
    }

    try {
      const updateData = {
        title: editNoteData.title.trim(),
        content: editNoteData.content || '',
        note_date: editNoteData.note_date,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', noteId)
        .eq('psychologist_id', user.id)
        .select()

      if (error) {
        console.error('Erro ao atualizar nota:', error)
        alert('Erro ao atualizar nota: ' + error.message)
      } else {
        // Atualizar a nota na lista local
        setNotes(notes.map(note => 
          note.id === noteId ? { ...note, ...updateData } : note
        ))
        
        // Sair do modo de edição
        setEditingNoteId(null)
        setEditNoteData({ title: '', content: '', note_date: '' })
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao atualizar nota')
    }

    fetchSessions(patient.id)
  }

  const saveTreatmentPlan = async () => {
    if (!treatmentPlanData.title.trim()) {
      alert('Por favor, insira um título para o plano terapêutico.')
      return
    }
    
    if (!patient) {
      alert('Informações do paciente não disponíveis')
      return
    }

    try {
      const newTreatmentPlan = {
        psychologist_id: user.id,
        patient_id: patient.id,
        title: treatmentPlanData.title.trim(),
        content: treatmentPlanData.content || '',
        plan_date: treatmentPlanData.plan_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('treatment_plans')
        .insert([newTreatmentPlan])
        .select()

      if (error) {
        console.error('Erro ao salvar plano terapêutico:', error)
      } else {
        // Adicionar o novo treatment plan à lista
        setTreatmentPlans([data[0], ...treatmentPlans])
        
        // Limpar formulário
        setTreatmentPlanData({
          title: '',
          content: '',
          plan_date: new Date().toISOString().split('T')[0]
        })
        
        // Fechar formulário
        setShowAddTreatmentPlan(false)
        setTriedSaveTreatmentPlan(false);
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao salvar plano terapêutico')
    }
  }

  const deleteTreatmentPlan = async (treatmentPlanId) => {
    if (!confirm('Tem certeza de que deseja excluir este plano terapêutico? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('treatment_plans')
        .delete()
        .eq('id', treatmentPlanId)
        .eq('psychologist_id', user.id)

      if (error) {
        console.error('Erro ao excluir plano terapêutico:', error)
        alert('Erro ao excluir plano terapêutico: ' + error.message)
      } else {
        // Remove o treatment plan da lista local
        setTreatmentPlans(treatmentPlans.filter(plan => plan.id !== treatmentPlanId))
        alert('Plano terapêutico excluído com sucesso!')
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao excluir plano terapêutico')
    }
  }

  const startEditTreatmentPlan = (treatmentPlan) => {
    setEditingTreatmentPlanId(treatmentPlan.id)
    setEditTreatmentPlanData({
      title: treatmentPlan.title,
      content: treatmentPlan.content || '',
      plan_date: treatmentPlan.plan_date
    })
  }

  const cancelEditTreatmentPlan = () => {
    setEditingTreatmentPlanId(null)
    setEditTreatmentPlanData({
      title: '',
      content: '',
      plan_date: ''
    })
  }

  const saveEditTreatmentPlan = async (treatmentPlanId) => {
    if (!editTreatmentPlanData.title.trim()) {
      alert('Por favor, insira um título para o plano terapêutico.')
      return
    }

    try {
      const updateData = {
        title: editTreatmentPlanData.title.trim(),
        content: editTreatmentPlanData.content || '',
        plan_date: editTreatmentPlanData.plan_date,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('treatment_plans')
        .update(updateData)
        .eq('id', treatmentPlanId)
        .eq('psychologist_id', user.id)
        .select()

      if (error) {
        console.error('Erro ao atualizar plano terapêutico:', error)
        alert('Erro ao atualizar plano terapêutico: ' + error.message)
      } else {
        // Atualizar o treatment plan na lista local
        setTreatmentPlans(treatmentPlans.map(plan => 
          plan.id === treatmentPlanId ? { ...plan, ...updateData } : plan
        ))
        
        // Sair do modo de edição
        setEditingTreatmentPlanId(null)
        setEditTreatmentPlanData({ title: '', content: '', plan_date: '' })
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao atualizar plano terapêutico')
    }
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
          <div className="space-y-6">
            {/* Add Note Button */}
            <div className="flex justify-end items-center">
              <Button 
                onClick={() => setShowAddNote(!showAddNote)}
                className="flex items-center space-x-2"
                variant={showAddNote ? 'secondary' : 'primary'}
              >
                <Plus className="w-4 h-4" />
                <span>{showAddNote ? 'Cancelar' : 'Nova Nota'}</span>
              </Button>
            </div>

            {/* Formulário de criação de nota - aparece quando showAddNote é true */}
            {showAddNote && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label htmlFor="note-title" className="block text-sm font-medium text-gray-700">Título da Nota</label>
                    <input
                      id="note-title"
                      type="text"
                      value={noteData.title}
                      onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                      placeholder="Título da Nota *"
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full ${!validarTitulo(noteData.title) ? (triedSaveNote ? 'border-red-200 bg-red-50' : 'border-gray-300') : 'border-gray-300'}`}
                    />
                    {!validarTitulo(noteData.title) && triedSaveNote && (
                      <p className="text-red-500 text-xs mt-1">O título é obrigatório.</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="note-date" className="block text-sm font-medium text-gray-700">Data da Nota</label>
                    <input
                      id="note-date"
                      type="date"
                      value={noteData.note_date}
                      onChange={(e) => setNoteData({...noteData, note_date: e.target.value})}
                      placeholder="Data da Nota *"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <RichTextEditorLazy
                    value={noteData.content}
                    onChange={(content) => setNoteData({...noteData, content})}
                    placeholder="Escreva aqui as suas notas clínicas..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => { setShowAddNote(false); setTriedSaveNote(false); }}
                    variant="secondary"
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => { setTriedSaveNote(true); saveNote(); }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    disabled={!validarTitulo(noteData.title)}
                  >
                    Guardar Nota
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de notas redesenhada */}
            <div className="space-y-10">
              {notes.length === 0 && (
                <div className="text-gray-500 text-center py-12">Adiciona uma nota</div>
              )}
              {notes.map((note, index) => {
                const noteDate = new Date(note.note_date)
                const prevNote = index > 0 ? notes[index - 1] : null
                const prevDate = prevNote ? new Date(prevNote.note_date) : null
                const showDateHeader = !prevDate || noteDate.toDateString() !== prevDate.toDateString()
                const preview = note.content
                  ? note.content.replace(/<[^>]+>/g, '').split('\n').slice(0, 3).join(' ').slice(0, 120) + (note.content.length > 120 ? '...' : '')
                  : 'No content';
                const isExpanded = expandedNoteId === note.id;
                return (
                  <div key={note.id}>
                    {/* Note Card Redesigned */}
                    <div className="flex">
                      <div className="flex-shrink-0 w-24 flex justify-center">
                        <div className="w-px h-full relative flex flex-col items-center">
                          <div className="bg-gray-200" style={{ height: '22px', width: '2px' }} />
                          <div className="text-xs text-gray-500 whitespace-nowrap select-none font-medium my-1">
                            {formatDateUtil(note.note_date, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                          <div className="bg-gray-200 flex-1 w-[2px]" />
                        </div>
                      </div>
                      <div className="flex-1 ml-4 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow group relative">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-gray-900 truncate max-w-[70%]">{note.title}</h4>
                          </div>
                          {isExpanded ? (
                            editingNoteId === note.id ? (
                              // Formulário de edição inline
                              <form onSubmit={e => { e.preventDefault(); saveEditNote(note.id); }} className="space-y-3">
                                <label htmlFor="edit-note-title" className="block text-sm font-medium text-gray-700">Título da Nota</label>
                                <input
                                  id="edit-note-title"
                                  type="text"
                                  value={editNoteData.title}
                                  onChange={e => setEditNoteData({ ...editNoteData, title: e.target.value })}
                                  placeholder="Título da Nota *"
                                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 font-bold ${!validarTitulo(editNoteData.title) ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                                  required
                                />
                                {(!validarTitulo(editNoteData.title) && editNoteData.title.trim() !== '') && (
                                  <p className="text-red-500 text-xs mt-1">O título é obrigatório.</p>
                                )}
                                <label htmlFor="edit-note-date" className="block text-sm font-medium text-gray-700 mt-2">Data da Nota</label>
                                <input
                                  id="edit-note-date"
                                  type="date"
                                  value={editNoteData.note_date}
                                  onChange={e => setEditNoteData({ ...editNoteData, note_date: e.target.value })}
                                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                  required
                                />
                                <RichTextEditorLazy
                                  value={editNoteData.content}
                                  onChange={(content) => setEditNoteData({ ...editNoteData, content })}
                                  placeholder="Write your clinical notes here..."
                                />
                                <div className="flex items-center justify-between mt-2">
                                  <Button
                                    onClick={cancelEditNote}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Cancelar
                                  </Button>
                                  <div className="flex gap-2">
                                    <Button type="submit" className="px-3 py-1 text-sm font-medium">Salvar</Button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              // Visualização expandida
                              <>
                                <div className="prose prose-sm max-w-none text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: note.content }} />
                                <div className="flex items-center justify-between mt-2">
                                  <button onClick={() => setExpandedNoteId(null)} className="text-blue-600 hover:underline text-xs bg-transparent border-none p-0 m-0">Ver menos</button>
                                  <div className="flex gap-2">
                                    <button onClick={() => { setExpandedNoteId(note.id); startEditNote(note); }} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              </>
                            )
                          ) : (
                            // Visualização compacta
                            <>
                              <div className="text-gray-700 text-sm mb-2 truncate" style={{ maxHeight: '3.6em', overflow: 'hidden' }}>{preview}</div>
                              <div className="flex items-center justify-between mt-2">
                                <button onClick={() => setExpandedNoteId(note.id)} className="text-blue-600 hover:underline text-xs bg-transparent border-none p-0 m-0">Ver mais</button>
                                <div className="flex gap-2">
                                  <button onClick={() => { setExpandedNoteId(note.id); startEditNote(note); }} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'treatment':
        return (
          <div className="space-y-6">
            {/* Add Treatment Plan Button */}
            <div className="flex justify-end items-center">
              <Button 
                onClick={() => setShowAddTreatmentPlan(!showAddTreatmentPlan)}
                className="flex items-center space-x-2"
                variant={showAddTreatmentPlan ? 'secondary' : 'primary'}
              >
                <Plus className="w-4 h-4" />
                <span>{showAddTreatmentPlan ? 'Cancelar' : 'Adicionar Plano Terapêutico'}</span>
              </Button>
            </div>

            {/* Add Treatment Plan Form */}
            {showAddTreatmentPlan && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label htmlFor="plan-title" className="block text-sm font-medium text-gray-700">Título do Plano</label>
                    <input
                      id="plan-title"
                      type="text"
                      value={treatmentPlanData.title}
                      onChange={(e) => setTreatmentPlanData({...treatmentPlanData, title: e.target.value})}
                      placeholder="Título do Plano *"
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full ${!validarTitulo(treatmentPlanData.title) ? (triedSaveTreatmentPlan ? 'border-red-200 bg-red-50' : 'border-gray-300') : 'border-gray-300'}`}
                    />
                    {!validarTitulo(treatmentPlanData.title) && triedSaveTreatmentPlan && (
                      <p className="text-red-500 text-xs mt-1">O título é obrigatório.</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="plan-date" className="block text-sm font-medium text-gray-700">Data do Plano</label>
                    <input
                      id="plan-date"
                      type="date"
                      value={treatmentPlanData.plan_date}
                      onChange={(e) => setTreatmentPlanData({...treatmentPlanData, plan_date: e.target.value})}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <RichTextEditorLazy
                    value={treatmentPlanData.content}
                    onChange={(content) => setTreatmentPlanData({...treatmentPlanData, content})}
                    placeholder="Descreva o plano terapêutico, objetivos, métodos, cronograma..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => { setShowAddTreatmentPlan(false); setTriedSaveTreatmentPlan(false); }}
                    variant="secondary"
                    className="px-3 py-1 text-sm font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => { setTriedSaveTreatmentPlan(true); saveTreatmentPlan(); }}
                    className="px-3 py-1 text-sm font-medium"
                    disabled={!validarTitulo(treatmentPlanData.title)}
                  >
                    Guardar Plano Terapêutico
                  </Button>
                </div>
              </div>
            )}

            {/* Treatment Plans List */}
            {treatmentPlansLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="flex justify-center items-center mb-4 gap-2">
                    <Brain className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Ainda não existem planos terapêuticos</h4>
                  <p className="text-gray-500 mb-4">Comece por criar o primeiro plano terapêutico para este paciente.</p>
                </div>
              </div>
            ) : treatmentPlans.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="flex justify-center items-center mb-4 gap-2">
                    <Brain className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Ainda não existem planos terapêuticos</h4>
                  <p className="text-gray-500 mb-4">Comece por criar o primeiro plano terapêutico para este paciente.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {treatmentPlans.map((plan, index) => {
                  const isEditing = editingTreatmentPlanId === plan.id;
                  const isExpanded = expandedNoteId === plan.id; // Reusing the same state for simplicity
                  const planDate = new Date(plan.plan_date)
                  const prevPlan = index > 0 ? treatmentPlans[index - 1] : null
                  const prevDate = prevPlan ? new Date(prevPlan.plan_date) : null
                  const showDateHeader = !prevDate || planDate.toDateString() !== prevDate.toDateString()
                  
                  return (
                    <div key={plan.id}>
                      {/* Treatment Plan Card */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[180px]">
                        {/* Data do Plano compacta */}
                        <div className="mb-2">
                          <span className="block text-sm font-medium text-gray-700">Data do Plano</span>
                          <span className="block text-base text-gray-900 font-semibold">{formatDate(plan.plan_date)}</span>
                        </div>
                        
                        {isEditing ? (
                          // Formulário de edição inline
                          <div className="space-y-3">
                            <label htmlFor="edit-plan-title" className="block text-sm font-medium text-gray-700">Título do Plano</label>
                            <input
                              id="edit-plan-title"
                              type="text"
                              value={editTreatmentPlanData.title}
                              onChange={e => setEditTreatmentPlanData({ ...editTreatmentPlanData, title: e.target.value })}
                              placeholder="Título do Plano *"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 font-bold ${!validarTitulo(editTreatmentPlanData.title) ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                              required
                            />
                            {(!validarTitulo(editTreatmentPlanData.title) && editTreatmentPlanData.title.trim() !== '') && (
                              <p className="text-red-500 text-xs mt-1">O título é obrigatório.</p>
                            )}
                            <label htmlFor="edit-plan-date" className="block text-sm font-medium text-gray-700 mt-2">Data do Plano</label>
                            <input
                              id="edit-plan-date"
                              type="date"
                              value={editTreatmentPlanData.plan_date}
                              onChange={e => setEditTreatmentPlanData({ ...editTreatmentPlanData, plan_date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              required
                            />
                            <RichTextEditorLazy
                              value={editTreatmentPlanData.content}
                              onChange={(content) => setEditTreatmentPlanData({ ...editTreatmentPlanData, content })}
                              placeholder="Descreva o plano terapêutico, objetivos, métodos, cronograma..."
                            />
                            <div className="flex items-center justify-between mt-2">
                              <Button
                                onClick={cancelEditTreatmentPlan}
                                variant="secondary"
                                className="text-xs"
                              >
                                Cancelar
                              </Button>
                              <div className="flex gap-2">
                                <Button onClick={() => saveEditTreatmentPlan(plan.id)} className="px-3 py-1 text-sm font-medium">Guardar</Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{plan.title}</h4>
                            <div className="flex-1">
                              {plan.content && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="text-gray-700">
                                    {isExpanded || !plan.content || plan.content.length <= 150 ? (
                                      <>
                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plan.content }} />
                                        {plan.content.length > 150 && (
                                          <div className="flex items-center justify-between mt-2">
                                            <button onClick={() => setExpandedNoteId(null)} className="text-blue-600 hover:underline text-xs bg-transparent border-none p-0 m-0">Ver menos</button>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plan.content.substring(0, 150) + '...' }} />
                                        <div className="flex items-center justify-between mt-2">
                                          <button onClick={() => setExpandedNoteId(plan.id)} className="text-blue-600 hover:underline text-xs bg-transparent border-none p-0 m-0">Ver mais</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                onClick={() => startEditTreatmentPlan(plan)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit treatment plan"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTreatmentPlan(plan.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete treatment plan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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
            {sessionsLoading ? (
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
            fetchSessions(patient.id)
          }}
          user={user}
          patients={[patient]}
          preSelectedPatient={patient.id}
        />
        <AddPatientSidebar
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={(deleted = false) => {
            setEditingPatient(null)
            if (deleted) {
              router.push('/patients')
            } else {
              fetchPatient(user.id, patient.id)
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
            fetchSessions(patient.id);
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