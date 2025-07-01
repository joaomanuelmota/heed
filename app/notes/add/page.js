'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import RichTextEditor from '../../../components/RichTextEditor'
import { Save, X, Calendar, User } from 'lucide-react'

export default function AddNotePage() {
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    note_date: new Date().toISOString().split('T')[0], // Today's date
    patient_id: searchParams.get('patient_id') || ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        fetchPatients(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  const fetchPatients = async (psychologistId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, firstName, lastName')
        .eq('psychologist_id', psychologistId)
        .order('firstName', { ascending: true })

      if (error) {
        console.error('Error fetching patients:', error)
      } else {
        setPatients(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNoteData({
      ...noteData,
      [name]: value
    })

    // Auto-generate title when patient is selected
    if (name === 'patient_id' && value) {
      const selectedPatient = patients.find(p => p.id == value)
      if (selectedPatient && !noteData.title) {
        setNoteData(prev => ({
          ...prev,
          [name]: value,
          title: `Session notes - ${selectedPatient.firstName} ${selectedPatient.lastName}`
        }))
      }
    }
  }

  const handleContentChange = (content) => {
    setNoteData({
      ...noteData,
      content: content
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Basic validation
    if (!noteData.patient_id) {
      setMessage('Please select a patient')
      setSaving(false)
      return
    }

    if (!noteData.title.trim()) {
      setMessage('Please enter a title')
      setSaving(false)
      return
    }

    try {
      // Prepare note data
      const newNote = {
        psychologist_id: user.id,
        patient_id: parseInt(noteData.patient_id),
        title: noteData.title.trim(),
        content: noteData.content || null,
        note_date: noteData.note_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating note:', newNote)

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        setMessage(`Error: ${error.message}`)
      } else {
        console.log('Note created successfully:', data)
        setMessage('Note created successfully!')
        
        // Clear form
        setNoteData({
          title: '',
          content: '',
          note_date: new Date().toISOString().split('T')[0],
          patient_id: ''
        })
        
        // Redirect to notes list after 2 seconds
        setTimeout(() => {
          router.push('/notes')
        }, 2000)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage(`Unexpected error: ${error.message}`)
    }

    setSaving(false)
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-gray-600 text-xl mb-4">No patients found</div>
          <p className="text-gray-500 mb-6">You need to add patients before creating notes.</p>
          <Link 
            href="/patients/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Add Your First Patient
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Note</h1>
            <p className="text-gray-600 mt-2">Document your session observations and thoughts</p>
          </div>
          <Link
            href="/notes"
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Patient and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Patient Selection */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Patient *
              </label>
              <select
                name="patient_id"
                value={noteData.patient_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                required
                disabled={saving}
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Note Date *
              </label>
              <input
                type="date"
                name="note_date"
                value={noteData.note_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Note Title *
            </label>
            <input
              type="text"
              name="title"
              value={noteData.title}
              onChange={handleChange}
              placeholder="e.g., Session notes, Behavioral observations, Treatment progress..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
              required
              disabled={saving}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Note Content
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor
                value={noteData.content}
                onChange={handleContentChange}
                placeholder="Write your detailed notes here. You can use formatting, lists, and other rich text features..."
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use the toolbar above to format your text, create lists, add links, and more.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/notes"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}