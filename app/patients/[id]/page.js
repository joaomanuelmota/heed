'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function PatientProfile() {
  const [user, setUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (dateString) => {
    if (!dateString) return 'Unknown'
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return `${age} years old`
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id)
        .eq('psychologist_id', user.id)

      if (error) {
        alert(`Error deleting patient: ${error.message}`)
      } else {
        alert('Patient deleted successfully')
        router.push('/patients')
      }
    } catch (error) {
      alert(`Unexpected error: ${error.message}`)
    }
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
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link 
            href="/patients"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Patient not found</div>
          <Link 
            href="/patients"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-600">Patient Profile</p>
            </div>
            <div className="flex space-x-3">
              <Link 
                href={`/patients/${patient.id}/edit`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Edit Patient
              </Link>
              <Link 
                href="/patients"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Back to Patients
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Patient Information Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Personal Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900">{patient.firstName} {patient.lastName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-gray-900">{formatDate(patient.dateOfBirth)}</p>
                    {patient.dateOfBirth && (
                      <p className="text-sm text-gray-500">{calculateAge(patient.dateOfBirth)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{patient.email || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="text-gray-900">{patient.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {patient.address && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Address</h4>
                <p className="text-gray-900">{patient.address}</p>
              </div>
            )}

            {/* Account Details */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Account Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Patient Added</label>
                  <p className="text-gray-900">{formatDate(patient.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Patient ID</label>
                  <p className="text-gray-900 font-mono text-sm">{patient.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/patients/${patient.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Edit Patient Information
              </Link>
              
              <button 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                onClick={() => alert('Session scheduling coming soon!')}
              >
                Schedule Session
              </button>
              
              <button 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}