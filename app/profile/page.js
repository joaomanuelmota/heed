"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Button from '../../components/Button'

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setProfile({
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
        })
      } else {
        router.push('/login')
      }
    } catch (error) {
      setError('Erro ao buscar usuário')
      setLoading(false)
    }
    setLoading(false)
  }

  const validate = () => {
    const newErrors = {}
    if (!profile.firstName) newErrors.firstName = 'O nome é obrigatório.'
    if (!profile.lastName) newErrors.lastName = 'O apelido é obrigatório.'
    if (!profile.email) newErrors.email = 'O email é obrigatório.'
    else if (!validarEmail(profile.email)) newErrors.email = 'O email não é válido.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSave = async () => {
    setMessage('')
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      // Atualizar user_metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
        }
      })
      // Atualizar email se mudou
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: profile.email })
        if (emailError) {
          setError('Erro ao atualizar email: ' + emailError.message)
          setLoading(false)
          return
        }
      }
      if (metaError) {
        setError('Erro ao atualizar perfil: ' + metaError.message)
      } else {
        setMessage('Perfil atualizado com sucesso!')
        setEditing(false)
        checkUser()
      }
    } catch (error) {
      setError('Erro ao atualizar perfil: ' + error.message)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">O Meu Perfil</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {message && <div className="mb-4 text-green-600">{message}</div>}
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave() }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-firstName" className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                id="profile-firstName"
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!editing}
                className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 ${errors.firstName && editing ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.firstName && editing && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="profile-lastName" className="block text-sm font-medium text-gray-700">Apelido</label>
              <input
                id="profile-lastName"
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!editing}
                className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 ${errors.lastName && editing ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.lastName && editing && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="profile-email"
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!editing}
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 ${errors.email && editing ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.email && editing && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div className="flex gap-2 mt-6">
            {editing ? (
              <>
                <Button type="submit" disabled={loading || !validate()}>Guardar</Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={loading}>Cancelar</Button>
              </>
            ) : (
              <Button type="button" onClick={() => setEditing(true)}>Editar Perfil</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 