'use client'
import { useState, useEffect } from 'react'
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
  Bold, Italic, List, ListOrdered, Save, Type
} from 'lucide-react'

export default function PatientProfile() {
  const [user, setUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
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
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="space-y-6">
            {/* Note Taking Interface */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Formatting Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-1">
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Bold">
                    <Bold className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Italic">
                    <Italic className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Underline">
                    <span className="w-4 h-4 flex items-center justify-center text-gray-600 font-semibold text-sm">U</span>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Bullet List">
                    <List className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Numbered List">
                    <ListOrdered className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Link">
                    <span className="w-4 h-4 flex items-center justify-center text-gray-600">🔗</span>
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Undo">
                    <span className="w-4 h-4 flex items-center justify-center text-gray-600">↶</span>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Redo">
                    <span className="w-4 h-4 flex items-center justify-center text-gray-600">↷</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-green-600">Auto-saved</span>
                  <button className="flex items-center space-x-2 px-4 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors font-medium">
                    <Plus className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="p-6">
                <div className="w-full min-h-[300px] focus:outline-none text-gray-900 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Notes Feature Coming Soon</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      The clinical notes feature will be available once the notes table is created in the database. 
                      You'll be able to create, edit, and manage patient notes with rich text formatting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Date and Time Footer */}
              <div className="px-6 pb-6">
                <div className="flex items-center space-x-4 text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>
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
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Payments</h3>
            <p className="text-gray-600 mb-4">
              Payment tracking and billing will be available once the payments table is created.
            </p>
            <p className="text-sm text-gray-500">Coming Soon</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-full mx-auto">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-2">
              <Link href="/patients" className="text-blue-600 hover:text-blue-700">
                ← Back to Patients
              </Link>
            </div>
          </div>
          
          {/* Patient Header Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="relative">
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-4 mb-3">
                      <h2 className="text-3xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h2>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${statusConfig.dot} rounded-full ${patient.status === 'active' ? 'animate-pulse' : ''}`}></div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SessionIcon className="w-4 h-4 text-gray-500" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${sessionTypeConfig.color}`}>
                          {sessionTypeConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-gray-600 mb-4">
                      <span>{patient.email || 'No email provided'}</span>
                      <span>•</span>
                      <span>{patient.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-gray-600 mb-2">
                      <span>Next session: {genericData.nextSession}</span>
                      <span>•</span>
                      <span>Last session: {genericData.lastSession}</span>
                      <span>•</span>
                      <span>Total sessions: {genericData.totalSessions}</span>
                    </div>
                    <div>
                      <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-gray-600"
                      >
                        {isExpanded ? 'View less' : 'View more'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/patients/${patient.id}/edit`}
                      className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/80 transition-all hover:scale-105 shadow-sm"
                    >
                      <Edit className="w-5 h-5 text-gray-700" />
                    </Link>
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-all hover:scale-105 shadow-lg">
                      Schedule Session
                    </button>
                  </div>
                </div>

                {/* Expanded Information */}
                {isExpanded && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                      {/* Left Column - Personal Details */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-3">Personal Details</p>
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-900">Age:</span> <span className="text-gray-700">{calculateAge(patient.dateOfBirth)} years</span></p>
                            <p><span className="font-medium text-gray-900">Date of Birth:</span> <span className="text-gray-700">{formatDate(patient.dateOfBirth)}</span></p>
                            <p><span className="font-medium text-gray-900">Address:</span> <span className="text-gray-700">{patient.address || 'Not provided'}</span></p>
                            <p><span className="font-medium text-gray-900">Specialty:</span> <span className="text-gray-700">{patient.specialty || 'Not specified'}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - VAT Information */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-3">VAT Information</p>
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-900">VAT Number:</span> <span className="text-gray-700">{genericData.vatNumber}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabbed Navigation */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100">
              <div className="flex space-x-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 px-8 py-6 font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}