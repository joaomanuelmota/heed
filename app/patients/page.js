'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { UserCheck, Plus } from 'lucide-react'
import AddPatientSidebar from '../../components/AddPatientSidebar'

export default function Patients() {
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [showAddSidebar, setShowAddSidebar] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const router = useRouter()

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
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false })

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

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`
    } else {
      return `${baseClasses} bg-red-100 text-red-800`
    }
  }

  const getSessionTypeBadge = (sessionType) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (sessionType) {
      case 'remote':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'on-site':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'hybrid':
        return `${baseClasses} bg-orange-100 text-orange-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatSpecialty = (specialty) => {
    if (!specialty) return 'Not specified'
    
    const specialtyMap = {
      'clinical': 'Clinical Psychology',
      'counseling': 'Counseling Psychology',
      'cognitive': 'Cognitive Psychology',
      'behavioral': 'Behavioral Psychology',
      'developmental': 'Developmental Psychology',
      'forensic': 'Forensic Psychology',
      'health': 'Health Psychology',
      'neuropsychology': 'Neuropsychology',
      'school': 'School Psychology',
      'social': 'Social Psychology',
      'sport': 'Sport Psychology',
      'trauma': 'Trauma Psychology',
      'addiction': 'Addiction Psychology',
      'family': 'Family Therapy',
      'couples': 'Couples Therapy',
      'group': 'Group Therapy',
      'other': 'Other'
    }
    
    return specialtyMap[specialty] || specialty
  }

  // Filter patients based on search term and filter dropdowns
  const filteredPatients = patients.filter(patient => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      const specialty = formatSpecialty(patient.specialty).toLowerCase();
      
      const matchesSearch = fullName.includes(searchLower) || 
                           email.includes(searchLower) || 
                           specialty.includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && patient.status !== statusFilter) {
      return false;
    }
    
    // Session type filter
    if (sessionTypeFilter !== 'all' && patient.session_type !== sessionTypeFilter) {
      return false;
    }
    
    // Specialty filter
    if (specialtyFilter !== 'all') {
      if (specialtyFilter === '' && patient.specialty) {
        return false; // Looking for "Not Specified" but patient has a specialty
      }
      if (specialtyFilter !== '' && patient.specialty !== specialtyFilter) {
        return false; // Looking for specific specialty but patient has different one
      }
    }
    
    return true;
  });

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || sessionTypeFilter !== 'all' || specialtyFilter !== 'all'

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <UserCheck className="w-4 h-4 mr-1" />
                {patients.filter(p => p.status === 'active').length} Active Patients
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowAddSidebar(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Patient
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">Search patients</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Search patients by name, email, or specialty..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Session Type Filter */}
          <div className="min-w-[140px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">All Session Types</option>
                <option value="on-site">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="min-w-[160px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">All Specialties</option>
                <option value="">Not Specified</option>
                <option value="clinical">Clinical Psychology</option>
                <option value="counseling">Counseling Psychology</option>
                <option value="cognitive">Cognitive Psychology</option>
                <option value="behavioral">Behavioral Psychology</option>
                <option value="developmental">Developmental Psychology</option>
                <option value="forensic">Forensic Psychology</option>
                <option value="health">Health Psychology</option>
                <option value="neuropsychology">Neuropsychology</option>
                <option value="school">School Psychology</option>
                <option value="social">Social Psychology</option>
                <option value="sport">Sport Psychology</option>
                <option value="trauma">Trauma Psychology</option>
                <option value="addiction">Addiction Psychology</option>
                <option value="family">Family Therapy</option>
                <option value="couples">Couples Therapy</option>
                <option value="group">Group Therapy</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setSessionTypeFilter('all')
                setSpecialtyFilter('all')
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        patients.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first patient</p>
            <Link 
              href="/patients/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Add Your First Patient
            </Link>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-6">No patients match your search for "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Clear Search
            </button>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      {patient.email && (
                        <div className="text-sm text-gray-500">
                          {patient.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(patient.status)}>
                        {patient.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getSessionTypeBadge(patient.session_type)}>
                        {patient.session_type === 'on-site' ? 'On-Site' : 
                         patient.session_type === 'remote' ? 'Remote' : 
                         patient.session_type === 'hybrid' ? 'Hybrid' : 
                         patient.session_type || 'Not set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatSpecialty(patient.specialty)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </main>

      {/* Overlay */}
      {showAddSidebar && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowAddSidebar(false)}
        />
      )}

      {/* Add Patient Sidebar */}
      <AddPatientSidebar 
        isOpen={showAddSidebar || editingPatient !== null}
        onClose={() => {
          setShowAddSidebar(false)
          setEditingPatient(null)
        }}
        onSuccess={() => {
          setShowAddSidebar(false)
          setEditingPatient(null)
          fetchPatients(user.id)
        }}
        user={user}
        mode={editingPatient ? 'edit' : 'add'}
        existingPatient={editingPatient}
      />
    </div>
  )
}