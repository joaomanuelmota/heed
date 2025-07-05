'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Save, User, Mail, Phone, Calendar, MapPin, Check, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

function CustomDropdown({ value, options, onChange, disabled, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(opt => opt.value === value)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        <span className="flex items-center">
          {/* <Check className="w-5 h-5 mr-2 text-gray-400" /> */}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                value === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'
              }`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {/* {value === opt.value ? (
                <Check className="w-4 h-4 mr-2 text-blue-600" />
              ) : (
                <span className="w-6 mr-2" />
              )} */}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AddPatientSidebar({ isOpen, onClose, onSuccess, user, mode = 'add', existingPatient = null }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [patientData, setPatientData] = useState({
    firstName: existingPatient?.firstName || '',
    lastName: existingPatient?.lastName || '',
    dateOfBirth: existingPatient?.dateOfBirth || '',
    vatNumber: existingPatient?.vatNumber || '',
    address: existingPatient?.address || '',
    email: existingPatient?.email || '',
    phone: existingPatient?.phone || '',
    status: existingPatient?.status || 'active',
    sessionType: existingPatient?.session_type || 'on-site'
  })

  useEffect(() => {
    if (mode === 'edit' && existingPatient) {
      setPatientData({
        firstName: existingPatient.firstName || '',
        lastName: existingPatient.lastName || '',
        dateOfBirth: existingPatient.dateOfBirth || '',
        vatNumber: existingPatient.vatNumber || '',
        address: existingPatient.address || '',
        email: existingPatient.email || '',
        phone: existingPatient.phone || '',
        status: existingPatient.status || 'active',
        sessionType: existingPatient.session_type || 'on-site'
      })
    } else if (mode === 'add') {
      setPatientData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        vatNumber: '',
        address: '',
        email: '',
        phone: '',
        status: 'active',
        sessionType: 'on-site'
      })
    }
    setMessage('')
  }, [mode, existingPatient])

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
      const submitData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email || null,
        phone: patientData.phone || null,
        dateOfBirth: patientData.dateOfBirth || null,
        vatNumber: patientData.vatNumber || null,
        address: patientData.address || null,
        status: patientData.status,
        session_type: patientData.sessionType,
        updated_at: new Date().toISOString()
      }

      let result;
      if (mode === 'edit') {
        // Update existing patient
        result = await supabase
          .from('patients')
          .update(submitData)
          .eq('id', existingPatient.id)
          .eq('psychologist_id', user.id)
      } else {
        // Create new patient
        submitData.psychologist_id = user.id
        submitData.created_at = new Date().toISOString()
        result = await supabase
          .from('patients')
          .insert([submitData])
      }

      if (result.error) {
        setMessage(`Error: ${result.error.message}`)
      } else {
        setMessage(mode === 'edit' ? 'Patient updated successfully!' : 'Patient added successfully!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    }

    setLoading(false)
  }

  const handleClose = () => {
    setMessage('')
    setPatientData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      vatNumber: '',
      address: '',
      email: '',
      phone: '',
      status: 'active',
      sessionType: 'on-site'
    })
    onClose()
  }

  return (
    <div 
      className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 overflow-y-auto"
      style={{ 
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)', 
        transition: 'transform 300ms ease-in-out' 
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {mode === 'edit' ? 'Edit Patient' : 'Add New Patient'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <input type="text" name="firstName" value={patientData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" required disabled={loading} placeholder="First Name *" />
              </div>
              <div>
                <input type="text" name="lastName" value={patientData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" required disabled={loading} placeholder="Last Name *" />
              </div>
              <div>
                <input type="date" name="dateOfBirth" value={patientData.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Date of Birth" />
              </div>
              <div>
                <input 
                  type="text" 
                  name="vatNumber" 
                  value={patientData.vatNumber} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" 
                  disabled={loading} 
                  placeholder="Enter VAT number" 
                />
              </div>
              <div>
                <input type="text" name="address" value={patientData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="City" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <input type="email" name="email" value={patientData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Email Address" />
              </div>
              <div>
                <input type="tel" name="phone" value={patientData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900" disabled={loading} placeholder="Phone Number" />
              </div>
            </div>
          </div>

          {/* Session Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Session Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <CustomDropdown
                  value={patientData.status}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                  onChange={val => setPatientData({ ...patientData, status: val })}
                  disabled={loading}
                  placeholder="Status"
                />
              </div>
              <div>
                <CustomDropdown
                  value={patientData.sessionType}
                  options={[
                    { value: 'on-site', label: 'On-Site' },
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' }
                  ]}
                  onChange={val => setPatientData({ ...patientData, sessionType: val })}
                  disabled={loading}
                  placeholder="Session Type"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading
                ? (mode === 'edit' ? 'Saving Changes...' : 'Adding Patient...')
                : (mode === 'edit' ? 'Save Changes' : 'Add Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 