'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import RichTextEditor from '../../../components/RichTextEditor'
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

  const updatePaymentStatus = async (sessionId, newStatus) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('psychologist_id', user.id)

      if (error) {
        console.error('Error updating payment status:', error)
        alert('Error updating payment status: ' + error.message)
      } else {
        // Atualizar a sessão na lista local
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, payment_status: newStatus }
            : session
        ))
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Unexpected error updating payment status')
    }
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      paid: { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' },
      'invoice issued': { label: 'Invoice Issued', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    }
    return statusConfig[status] || statusConfig.pending
  }

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
                    onChange={(content) => setNoteData({...noteData, content: content})}
                    placeholder="Note Content..."
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
                                  onChange={content => setEditNoteData({ ...editNoteData, content })}
                                  placeholder="Edit your note content..."
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
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Treatment Plan</h3>
            <p className="text-gray-600 mb-4">
              Treatment plan management will be available once the treatment_plans table is created.
            </p>
            <p className="text-sm text-gray-500">Coming Soon</p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
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
                            <select
                              value={session.payment_status || 'pending'}
                              onChange={(e) => updatePaymentStatus(session.id, e.target.value)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                getPaymentStatusBadge(session.payment_status || 'pending').color
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="invoice issued">Invoice Issued</option>
                            </select>
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