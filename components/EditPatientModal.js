'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function EditPatientModal({ isOpen, onClose, patient, onSave }) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  
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

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen && patient) {
      // Get current user
      const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
      getCurrentUser()
      
      setPatientData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        address: patient.address || '',
        status: patient.status || 'active',
        sessionType: patient.session_type || 'on-site',
        specialty: patient.specialty || ''
      })
      setMessage('')
    }
  }, [isOpen, patient])

  const handleChange = (e) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // Prepare data - FIX: Use correct field mapping
      const updateData = {
        firstName: patientData.firstName.trim(),
        lastName: patientData.lastName.trim(),
        email: patientData.email?.trim() || null,
        phone: patientData.phone?.trim() || null,
        dateOfBirth: patientData.dateOfBirth || null,
        address: patientData.address?.trim() || null,
        status: patientData.status,
        session_type: patientData.sessionType, // FIX: Correct field name
        specialty: patientData.specialty || null
        // Removed updated_at since it doesn't exist in the table
      }

      // Get current user for the update
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      console.log('=== DEBUGGING MODAL UPDATE ===')
      console.log('Patient ID:', patient.id)
      console.log('Update data:', updateData)
      console.log('User who is updating:', currentUser?.id)
      console.log('Patient psychologist_id:', patient.psychologist_id)
      console.log('User IDs match?', patient.psychologist_id === currentUser?.id)

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patient.id)
        .eq('psychologist_id', currentUser?.id) // Add this security check
        .select()

      console.log('Supabase response data:', data)
      console.log('Supabase response error:', error)

      if (error) {
        console.error('Supabase error:', error)
        setMessage(`Error: ${error.message}`)
      } else if (!data || data.length === 0) {
        console.warn('Update returned no data - check if patient exists and user has permission')
        setMessage('Error: No patient was updated. Check permissions.')
      } else {
        console.log('Update successful:', data)
        setMessage('Patient updated successfully!')
        
        // Close modal after 1 second
        setTimeout(() => {
          onSave() // Refresh parent component
          onClose() // Close modal
        }, 1000)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage(`Unexpected error: ${error.message}`)
    }

    setSaving(false)
  }

  const handleClose = () => {
    if (!saving) {
      setMessage('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Patient: {patient?.firstName} {patient?.lastName}
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">
          
          {message && (
            <div className={`p-3 mb-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
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
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Phone
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
            </div>

            {/* Date of Birth */}
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

            {/* Status and Session Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Specialty */}
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

            {/* Address */}
            <div>
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

          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}