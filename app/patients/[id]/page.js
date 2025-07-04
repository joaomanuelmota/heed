'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
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
import RichTextEditor from '../../../components/RichTextEditor'
import ReactDOM from 'react-dom'

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
    { value: 'to pay', label: 'To Pay' },
    { value: 'paid', label: 'Paid' },
    { value: 'invoice issued', label: 'Invoice Issued' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Novo estado para coordenadas do dropdown
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const badgeRefs = useRef({});

  const router = useRouter()
  const params = useParams()

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
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const fetchNotes = async (patientId) => {
    console.log('fetchNotes called with:', { patientId, user: !!user })
    
    if (!user) {
      console.log('No user, skipping fetchNotes')
      return
    }
    
    setNotesLoading(true)
    try {
      console.log('Fetching notes for patient:', patientId, 'psychologist:', user.id)
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', user.id)
        .order('note_date', { ascending: false })

      console.log('Notes fetch result:', { data, error })

      if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data || [])
        console.log('Notes set to:', data?.length || 0, 'notes')
      }
    } catch (error) {
      console.error('Unexpected error fetching notes:', error)
    }
    setNotesLoading(false)
  }

  const fetchTreatmentPlans = async (patientId) => {
    console.log('fetchTreatmentPlans called with:', { patientId, user: !!user })
    
    if (!user) {
      console.log('No user, skipping fetchTreatmentPlans')
      return
    }
    
    setTreatmentPlansLoading(true)
    try {
      console.log('Fetching treatment plans for patient:', patientId, 'psychologist:', user.id)
      
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', user.id)
        .order('plan_date', { ascending: false })

      console.log('Treatment plans fetch result:', { data, error })

      if (error) {
        console.error('Error fetching treatment plans:', error)
      } else {
        setTreatmentPlans(data || [])
        console.log('Treatment plans set to:', data?.length || 0, 'plans')
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
      colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200 group-hover:bg-yellow-200 group-hover:shadow";
    } else {
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 group-hover:bg-gray-200 group-hover:shadow";
    }
    return (
      <span className={`${badgeClass} ${colorClass}`} tabIndex={0}>
        {status === 'invoice issued' ? 'Invoice Issued' : status === 'to pay' ? 'To Pay' : status === 'cancelled' ? 'Cancelled' : status.charAt(0).toUpperCase() + status.slice(1)}
        <span className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mb-1" />
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mt-1" />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-30">Click to edit status</span>
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

  const saveNote = async () => {
    if (!noteData.title.trim()) {
      alert('Please enter a note title')
      return
    }
    
    if (!patient) {
      alert('Patient information not available')
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
        console.error('Error saving note:', error)
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
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Unexpected error saving note')
    }
  }

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('psychologist_id', user.id)

      if (error) {
        console.error('Error deleting note:', error)
        alert('Error deleting note: ' + error.message)
      } else {
        // Remove a nota da lista local
        setNotes(notes.filter(note => note.id !== noteId))
        alert('Note deleted successfully!')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Unexpected error deleting note')
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
      alert('Please enter a note title')
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
        console.error('Error updating note:', error)
        alert('Error updating note: ' + error.message)
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
      console.error('Unexpected error:', error)
      alert('Unexpected error updating note')
    }

    fetchSessions(patient.id)
  }

  const saveTreatmentPlan = async () => {
    if (!treatmentPlanData.title.trim()) {
      alert('Please enter a treatment plan title')
      return
    }
    
    if (!patient) {
      alert('Patient information not available')
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
        console.error('Error saving treatment plan:', error)
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
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Unexpected error saving treatment plan')
    }
  }

  const deleteTreatmentPlan = async (treatmentPlanId) => {
    if (!confirm('Are you sure you want to delete this treatment plan? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('treatment_plans')
        .delete()
        .eq('id', treatmentPlanId)
        .eq('psychologist_id', user.id)

      if (error) {
        console.error('Error deleting treatment plan:', error)
        alert('Error deleting treatment plan: ' + error.message)
      } else {
        // Remove o treatment plan da lista local
        setTreatmentPlans(treatmentPlans.filter(plan => plan.id !== treatmentPlanId))
        alert('Treatment plan deleted successfully!')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Unexpected error deleting treatment plan')
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
      alert('Please enter a treatment plan title')
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
        console.error('Error updating treatment plan:', error)
        alert('Error updating treatment plan: ' + error.message)
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
      console.error('Unexpected error:', error)
      alert('Unexpected error updating treatment plan')
    }
  }

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
      'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' }
    }
    return statusConfig[status] || statusConfig.active
  }

  const getSessionTypeDisplay = (type) => {
    const typeConfig = {
      remote: { label: 'Remote', color: 'bg-blue-100 text-blue-700', icon: Video },
      'on-site': { label: 'On-site', color: 'bg-purple-100 text-purple-700', icon: Users },
      hybrid: { label: 'Hybrid', color: 'bg-orange-100 text-orange-700', icon: Share }
    }
    return typeConfig[type] || typeConfig.remote
  }

  const tabs = [
    { id: 'notes', label: 'Note Taking', icon: FileText },
    { id: 'treatment', label: 'Treatment Plan', icon: Stethoscope },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'info', label: 'Info', icon: User }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="space-y-6">
            {/* Add Note Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Notes</h3>
              <button 
                onClick={() => setShowAddNote(!showAddNote)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddNote ? 'Cancel' : 'Add New Note'}</span>
              </button>
            </div>

            {/* Formulário de criação de nota - aparece quando showAddNote é true */}
            {showAddNote && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    value={noteData.title}
                    onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                    placeholder="Note Title *"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={noteData.note_date}
                    onChange={(e) => setNoteData({...noteData, note_date: e.target.value})}
                    placeholder="Note Date *"
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <RichTextEditor
                    value={noteData.content}
                    onChange={(content) => setNoteData({...noteData, content})}
                    placeholder="Write your clinical notes here..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNote}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {/* Lista de notas redesenhada */}
            <div className="space-y-10">
              {notes.length === 0 && (
                <div className="text-gray-500 text-center py-12">No notes found.</div>
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
                    {/* Date Header - só mostra se for uma data diferente da anterior */}
                    {showDateHeader && (
                      <div className="flex items-center mb-4 mt-6 first:mt-0">
                        <div className="flex-shrink-0 w-24 text-right pr-4">
                          <div className="text-sm font-semibold text-blue-600">
                            {noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {noteDate.getFullYear()}
                          </div>
                        </div>
                        <div className="flex-grow h-px bg-gray-200"></div>
                      </div>
                    )}
                    {/* Note Card Redesigned */}
                    <div className="flex">
                      <div className="flex-shrink-0 w-24 flex justify-center">
                        <div className="w-px bg-gray-200 h-full relative">
                          <div className="absolute top-4 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
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
                                <input
                                  type="text"
                                  value={editNoteData.title}
                                  onChange={e => setEditNoteData({ ...editNoteData, title: e.target.value })}
                                  placeholder="Note Title *"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                                  required
                                />
                                <input
                                  type="date"
                                  value={editNoteData.note_date}
                                  onChange={e => setEditNoteData({ ...editNoteData, note_date: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                  required
                                />
                                <RichTextEditor
                                  value={editNoteData.content}
                                  onChange={(content) => setEditNoteData({ ...editNoteData, content })}
                                  placeholder="Write your clinical notes here..."
                                />
                                <div className="flex items-center justify-between mt-2">
                                  <button type="button" onClick={cancelEditNote} className="text-gray-600 hover:underline text-xs">Cancelar</button>
                                  <div className="flex gap-2">
                                    <button type="submit" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Salvar</button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              // Visualização expandida
                              <>
                                <div className="prose prose-sm max-w-none text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: note.content }} />
                                <div className="flex items-center justify-between mt-2">
                                  <button onClick={() => setExpandedNoteId(null)} className="text-blue-600 hover:underline text-xs">Ver menos</button>
                                  <div className="flex gap-2">
                                    <button onClick={() => { setExpandedNoteId(note.id); startEditNote(note); }} className="text-gray-400 hover:text-blue-600" title="Editar"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-600" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              </>
                            )
                          ) : (
                            // Visualização compacta
                            <>
                              <div className="text-gray-700 text-sm mb-2 truncate" style={{ maxHeight: '3.6em', overflow: 'hidden' }}>{preview}</div>
                              <div className="flex items-center justify-between mt-2">
                                <button onClick={() => setExpandedNoteId(note.id)} className="text-blue-600 hover:underline text-xs">Ver mais</button>
                                <div className="flex gap-2">
                                  <button onClick={() => { setExpandedNoteId(note.id); startEditNote(note); }} className="text-gray-400 hover:text-blue-600" title="Editar"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-600" title="Excluir"><Trash2 className="w-4 h-4" /></button>
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Treatment Plans</h3>
              <button 
                onClick={() => setShowAddTreatmentPlan(!showAddTreatmentPlan)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddTreatmentPlan ? 'Cancel' : 'Add Treatment Plan'}</span>
              </button>
            </div>

            {/* Add Treatment Plan Form */}
            {showAddTreatmentPlan && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    value={treatmentPlanData.title}
                    onChange={(e) => setTreatmentPlanData({...treatmentPlanData, title: e.target.value})}
                    placeholder="Plan Title *"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={treatmentPlanData.plan_date}
                    onChange={(e) => setTreatmentPlanData({...treatmentPlanData, plan_date: e.target.value})}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <RichTextEditor
                    value={treatmentPlanData.content}
                    onChange={(content) => setTreatmentPlanData({...treatmentPlanData, content})}
                    placeholder="Describe the treatment plan, goals, methods, timeline..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddTreatmentPlan(false)}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTreatmentPlan}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Save Treatment Plan
                  </button>
                </div>
              </div>
            )}

            {/* Treatment Plans List */}
            {treatmentPlansLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading treatment plans...</p>
                </div>
              </div>
            ) : treatmentPlans.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Treatment Plans Yet</h4>
                  <p className="text-gray-500 mb-4">Start by creating your first treatment plan for this patient.</p>
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
                      {/* Date Header - só mostra se for uma data diferente da anterior */}
                      {showDateHeader && (
                        <div className="flex items-center mb-4 mt-6 first:mt-0">
                          <div className="flex-shrink-0 w-24 text-right pr-4">
                            <div className="text-sm font-semibold text-blue-600">
                              {planDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {planDate.getFullYear()}
                            </div>
                          </div>
                          <div className="flex-grow h-px bg-gray-200"></div>
                        </div>
                      )}
                      
                      {/* Treatment Plan Card */}
                      <div className="flex">
                        <div className="flex-shrink-0 w-24 flex justify-center">
                          <div className="w-px bg-gray-200 h-full relative">
                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
                          </div>
                        </div>
                        <div className="flex-1 ml-4 mb-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="space-y-4">
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                              <input
                                type="text"
                                value={editTreatmentPlanData.title}
                                onChange={(e) => setEditTreatmentPlanData({...editTreatmentPlanData, title: e.target.value})}
                                placeholder="Plan Title *"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                              <input
                                type="date"
                                value={editTreatmentPlanData.plan_date}
                                onChange={(e) => setEditTreatmentPlanData({...editTreatmentPlanData, plan_date: e.target.value})}
                                className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="mb-4">
                              <RichTextEditor
                                value={editTreatmentPlanData.content}
                                onChange={(content) => setEditTreatmentPlanData({...editTreatmentPlanData, content})}
                                placeholder="Describe the treatment plan, goals, methods, timeline..."
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelEditTreatmentPlan}
                                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditTreatmentPlan(plan.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-medium text-gray-900 mb-2">{plan.title}</h4>
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{new Date(plan.plan_date).toLocaleDateString()}</span>
                                  <span className="mx-2">•</span>
                                  <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
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
                            </div>

                            {plan.content && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-700">
                                  {isExpanded || !plan.content || plan.content.length <= 150 ? (
                                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plan.content }} />
                                  ) : (
                                    <>
                                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plan.content.substring(0, 150) + '...' }} />
                                      <div className="flex items-center justify-between mt-2">
                                        <button onClick={() => setExpandedNoteId(plan.id)} className="text-blue-600 hover:underline text-xs">Ver mais</button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                            </div>
                          </div>
                        </div>
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Session Payments</h3>
              <div className="text-sm text-gray-500">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
              </div>
            </div>

            {/* Sessions Table */}
            {sessionsLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading sessions...</p>
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions found for this patient.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {session.title || 'Session'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.notes ? `${session.notes.substring(0, 50)}...` : 'No notes'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(session.session_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            {session.session_time && (
                              <div className="text-sm text-gray-500">
                                {session.session_time}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.duration_minutes} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{session.session_fee || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStatusId === session.id ? (
                              <>
                                <span
                                  ref={el => badgeRefs.current[session.id] = el}
                                  style={{ visibility: 'hidden', position: 'absolute' }}
                                >
                                  {getStatusBadge(session.payment_status)}
                                </span>
                                {ReactDOM.createPortal(
                                  <div
                                    className="fixed min-w-[140px] bg-white border border-gray-200 rounded shadow-lg z-[9999] drop-shadow-lg"
                                    style={{
                                      top: dropdownCoords.top,
                                      left: dropdownCoords.left,
                                      width: dropdownCoords.width
                                    }}
                                  >
                                    {statusOptions.map(opt => (
                                      <button
                                        key={opt.value}
                                        className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${session.payment_status === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'}`}
                                        onClick={async () => {
                                          await handleStatusChange(session.id, opt.value);
                                          setEditingStatusId(null);
                                        }}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>,
                                  document.body
                                )}
                              </>
                            ) : (
                              <span
                                ref={el => badgeRefs.current[session.id] = el}
                                onClick={() => {
                                  const rect = badgeRefs.current[session.id].getBoundingClientRect();
                                  setDropdownCoords({
                                    top: rect.bottom + window.scrollY + 4,
                                    left: rect.left + window.scrollX,
                                    width: rect.width
                                  });
                                  setEditingStatusId(session.id);
                                }}
                              >
                                {getStatusBadge(session.payment_status)}
                              </span>
                            )}
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div><span className="font-medium text-gray-900">Email:</span> <span className="text-gray-700">{patient.email || 'No email provided'}</span></div>
                <div><span className="font-medium text-gray-900">Phone:</span> <span className="text-gray-700">{patient.phone || 'No phone provided'}</span></div>
                <div><span className="font-medium text-gray-900">Age:</span> <span className="text-gray-700">{calculateAge(patient.dateOfBirth)} years</span></div>
                <div><span className="font-medium text-gray-900">Date of Birth:</span> <span className="text-gray-700">{formatDate(patient.dateOfBirth)}</span></div>
                <div><span className="font-medium text-gray-900">Address:</span> <span className="text-gray-700">{patient.address || 'Not provided'}</span></div>
                <div><span className="font-medium text-gray-900">Specialty:</span> <span className="text-gray-700">{patient.specialty || 'Not specified'}</span></div>
                <div><span className="font-medium text-gray-900">Session Type:</span> <span className="text-gray-700">{sessionTypeConfig.label}</span></div>
              </div>
              <div className="space-y-2">
                <div><span className="font-medium text-gray-900">VAT Number:</span> <span className="text-gray-700">{patient.vatNumber || 'Not provided'}</span></div>
                <div><span className="font-medium text-gray-900">Status:</span> <span className="text-gray-700">{statusConfig.label}</span></div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
              <span className={`inline-flex items-center px-3 py-1 ml-2 rounded-full text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
            <div className="text-gray-600 mt-1 text-sm">
              <span className="font-medium">Next Session:</span> {nextSession ? `${formatDate(nextSession.session_date)} at ${nextSession.session_time}` : 'No upcoming session'}
            </div>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setEditingPatient(patient)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => setShowScheduleSidebar(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Schedule Session
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
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
          <div className="p-6">
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
          onSuccess={() => {
            setEditingPatient(null)
            fetchPatient(user.id, patient.id)
          }}
          user={user}
          mode="edit"
          existingPatient={editingPatient}
        />
      </div>
    </div>
  )
}