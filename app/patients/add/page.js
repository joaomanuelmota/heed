'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function AddPatient() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

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
      // Prepare data with proper date handling
      const submitData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email || null,
        phone: patientData.phone || null,
        dateOfBirth: patientData.dateOfBirth || null,
        address: patientData.address || null,
        status: patientData.status,
        session_type: patientData.sessionType,
        specialty: patientData.specialty || null,
        psychologist_id: user.id,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('patients')
        .insert([submitData])

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Patient added successfully!')
        
        // Clear form
        setPatientData({
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
        
        setTimeout(() => {
          router.push('/patients')
        }, 2000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
            <Link 
              href="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Back to Dashboard
            </Link>
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href="/dashboard"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {loading ? 'Adding Patient...' : 'Add Patient'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}