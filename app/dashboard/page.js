'use client'
// Dashboard page with sidebar integration
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { CalendarDays, Euro, Users, Clock, Plus, FileText } from "lucide-react"
import AddPatientSidebar from '../../components/AddPatientSidebar'
import ScheduleSessionSidebar from '../../components/ScheduleSessionSidebar'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: googleSession, status } = useSession()
  const router = useRouter()
  const [today, setToday] = useState(new Date())
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showScheduleSession, setShowScheduleSession] = useState(false)

  useEffect(() => {
    checkUser()
    setToday(new Date())
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
    setLoading(false)
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

  const handleLogout = async () => {
    try {
      // Sign out from both Supabase and Google
      await supabase.auth.signOut()
      if (googleSession) {
        await signOut({ redirect: false })
      }
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleGoogleConnect = () => {
    signIn('google')
  }

  const handleGoogleDisconnect = () => {
    signOut({ redirect: false })
  }

  const getRecentPatients = () => {
    return patients.slice(0, 3) // Show last 3 patients
  }

  // Format date
  const dateString = today.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 md:gap-0 px-4 md:px-0 pt-6 md:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <div className="text-gray-500 text-sm">Today: {dateString}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddPatient(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium flex items-center gap-2"><Plus size={18}/> Add Patient</button>
          <button onClick={() => setShowScheduleSession(true)} className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium flex items-center gap-2"><CalendarDays size={18}/> Schedule Session</button>
        </div>
      </div>

      {/* Add Patient Sidebar */}
      <AddPatientSidebar
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSuccess={() => { setShowAddPatient(false); fetchPatients(user.id); }}
        user={user}
      />
      {/* Schedule Session Sidebar */}
      <ScheduleSessionSidebar
        isOpen={showScheduleSession}
        onClose={() => setShowScheduleSession(false)}
        onSuccess={() => setShowScheduleSession(false)}
        user={user}
        patients={patients}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4 md:px-0">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <Users className="w-7 h-7 text-blue-600 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Total Patients</div>
          <div className="text-2xl font-bold text-gray-900">{patients.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <Clock className="w-7 h-7 text-green-600 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Sessions Today</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <CalendarDays className="w-7 h-7 text-yellow-600 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Upcoming Sessions</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <Euro className="w-7 h-7 text-blue-700 mb-2" />
          <div className="text-sm text-gray-500 mb-1">Outstanding Revenue</div>
          <div className="text-2xl font-bold text-gray-900">--</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="text-gray-500 text-sm">No sessions scheduled for today.</div>
            {/* TODO: List today's sessions here */}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-gray-500 text-sm">No recent activity.</div>
            {/* TODO: List recent notes, new patients, session updates */}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-8">
          {/* Mini Financial Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mini Financial Overview</h2>
            <div className="text-gray-500 text-sm">--</div>
            {/* TODO: Add mini chart or summary here */}
          </div>
          {/* Patient Insights */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Insights</h2>
            <div className="text-gray-500 text-sm">--</div>
            {/* TODO: Top patients, new patients, birthdays */}
          </div>
        </div>
      </div>
    </div>
  )
}