'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

export default function EditPatient() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()

  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    status: 'active',
    sessionType: 'on-site',
    specialty: ''
  })

  const specialtyOptions = [
    { value: '', label: 'Select Specialty' },
    { value: 'clinical', label: 'Clinical Psychology' },
    { value: 'counseling', label: 'Counseling Psychology' },
    { value: 'cognitive', label: 'Cognitive Psychology' },
    { value: 'behavioral', label: 'Behavioral Psychology' },
    { value: 'developmental', label: 'Developmental Psychology' },
    { value: 'forensic', label: 'Forensic Psychology' },
    { value: 'health', label: 'Health Psychology' },
    { value: 'neuropsychology', label: 'Neuropsychology' },
    { value: 'school', label: 'School Psychology' },
    { value: 'social', label: 'Social Psychology' },
    { value: 'sport', label: 'Sport Psychology' },
    { value: 'trauma', label: 'Trauma Psychology' },
    { value: 'addiction', label: 'Addiction Psychology' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'couples', label: 'Couples Therapy' },
    { value: 'group', label: 'Group Therapy' },
    { value: 'other', label: 'Other' }
  ]

  // Add this debugging code right after all the useState declarations
  useEffect(() => {
    console.log('=== PATIENT DATA STATE CHANGED ===')
    console.log('Current patientData state:', patientData)
  }, [patientData])

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED/UPDATED ===')
    console.log('params.id:', params.id)
    console.log('user:', user)
  }, [params.id, user])

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
          setError('Patient not found or you do not have permission to edit this patient.')
        } else {
          setError(`Error fetching patient: ${error.message}`)
        }
      } else {
        // Populate form with existing data
        setPatientData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          address: data.address || '',
          status: data.status || 'active',
          sessionType: data.session_type || 'on-site',
          specialty: data.specialty || ''
        })
      }
    } catch (error) {
      setError(`Unexpected error: ${error.message}`)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    console.log('=== FORM FIELD CHANGED ===')
    console.log('Field name:', e.target.name)
    console.log('New value:', e.target.value)
    console.log('Previous state:', patientData)
    
    const newState = {
      ...patientData,
      [e.target.name]: e.target.value
    }
    
    console.log('New state will be:', newState)
    
    setPatientData(newState)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    console.log('=== DEBUGGING PATIENT UPDATE ===')
    console.log('Patient ID:', params.id)
    console.log('Patient ID type:', typeof params.id)
    console.log('User ID:', user.id)
    console.log('Form Data:', patientData)

    try {
      // Validação básica
      if (!patientData.firstName.trim() || !patientData.lastName.trim()) {
        setMessage('First name and last name are required!')
        setSaving(false)
        return
      }

      // Prepare data with proper handling
      const updateData = {
        firstName: patientData.firstName.trim(),
        lastName: patientData.lastName.trim(),
        email: patientData.email?.trim() || null,
        phone: patientData.phone?.trim() || null,
        dateOfBirth: patientData.dateOfBirth || null,
        address: patientData.address?.trim() || null,
        status: patientData.status,
        session_type: patientData.sessionType,
        specialty: patientData.specialty || null
      }

      console.log('Update Data being sent:', updateData)

      // Primeiro: verificar se o paciente existe e pertence ao user
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .eq('psychologist_id', user.id)
        .single()

      console.log('Existing patient check:', { existingPatient, checkError })

      if (checkError) {
        setMessage(`Error checking patient: ${checkError.message}`)
        setSaving(false)
        return
      }

      if (!existingPatient) {
        setMessage('Patient not found or you do not have permission to edit this patient')
        setSaving(false)
        return
      }

      // Agora fazer a atualização
      const { data, error, count } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', params.id)
        .eq('psychologist_id', user.id)
        .select()

      console.log('Update result:', { data, error, count })
      console.log('Number of rows affected:', count)

      if (error) {
        setMessage(`Error: ${error.message}`)
        console.error('Update failed:', error)
      } else {
        setMessage('Patient updated successfully!')
        console.log('Update completed successfully')
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push(`/patients/${params.id}`)
        }, 2000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
      console.error('Unexpected error:', error)
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/patients"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
            <div className="flex space-x-3">
              <Link 
                href={`/patients/${params.id}`}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Back to Patient
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          
          {message && (
            <div className={`p-3 mb-6 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={patientData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={patientData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={patientData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={patientData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={patientData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={patientData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Session Type
                  </label>
                  <select
                    name="sessionType"
                    value={patientData.sessionType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  >
                    <option value="on-site">On-Site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Specialty
                  </label>
                  <select
                    name="specialty"
                    value={patientData.specialty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    disabled={saving}
                  >
                    {specialtyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={patientData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href={`/patients/${params.id}`}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-lg font-medium ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {saving ? 'Updating...' : 'Update Patient'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}