"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Button from '../../components/Button'
import ConsentManager from '../../components/ConsentManager'
import { FaDownload, FaTrashAlt, FaEnvelope } from 'react-icons/fa';

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
  const [exporting, setExporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [deleteChecked, setDeleteChecked] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
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

  // Exporta todos os dados RGPD do utilizador
  const exportUserData = async () => {
    if (!user) return;
    setExporting(true);
    setMessage('');
    setError('');
    try {
      // 1. Dados de conta (auth.users)
      const account_data = {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        full_name: user.user_metadata?.full_name || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null
      };

      // 2. Pacientes
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', user.id);
      if (patientsError) throw new Error('Erro ao exportar pacientes');

      // 3. Sessões
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('psychologist_id', user.id);
      if (sessionsError) throw new Error('Erro ao exportar sessões');

      // 4. Notas
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('psychologist_id', user.id);
      if (notesError) throw new Error('Erro ao exportar notas');

      // 5. Planos de tratamento
      const { data: treatment_plans, error: plansError } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('psychologist_id', user.id);
      if (plansError) throw new Error('Erro ao exportar planos de tratamento');

      // 6. Consentimentos
      const { data: consents, error: consentsError } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id);
      if (consentsError) throw new Error('Erro ao exportar consentimentos');

      // Estrutura do ficheiro
      const exportData = {
        export_info: {
          exported_at: new Date().toISOString(),
          user_id: user.id,
          export_version: '1.0'
        },
        account_data,
        patients: patients || [],
        sessions: sessions || [],
        notes: notes || [],
        treatment_plans: treatment_plans || [],
        consents: consents || []
      };

      // Gerar ficheiro JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `heed-data-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('Exportação concluída com sucesso!');
    } catch (err) {
      setError('Erro ao exportar dados: ' + (err.message || err));
    }
    setExporting(false);
  }

  // Eliminação RGPD
  const deleteUserAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      // 1. Eliminar treatment_plans
      await supabase.from('treatment_plans').delete().eq('psychologist_id', user.id)
      // 2. Eliminar notes
      await supabase.from('notes').delete().eq('psychologist_id', user.id)
      // 3. Eliminar sessions
      await supabase.from('sessions').delete().eq('psychologist_id', user.id)
      // 4. Eliminar patients
      await supabase.from('patients').delete().eq('psychologist_id', user.id)
      // 5. Eliminar user_consents
      await supabase.from('user_consents').delete().eq('user_id', user.id)
      // 6. Eliminar conta de autenticação
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) throw new Error(authError.message)
      // Logout e redirect
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      setDeleteError('Erro ao eliminar conta: ' + (err.message || err))
    }
    setDeleting(false)
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
        {/* Consentimentos RGPD */}
        {user && <ConsentManager userId={user.id} />}
      </div>
      {/* Secção de Direitos RGPD */}
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Direitos de Proteção de Dados</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={exportUserData}
            disabled={exporting}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 transition-colors"
          >
            <FaDownload className="w-5 h-5" />
            {exporting ? 'A exportar...' : 'Exportar os Meus Dados'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium border border-red-200 transition-colors"
          >
            <FaTrashAlt className="w-5 h-5" />
            Eliminar a Minha Conta
          </button>
          <button
            onClick={() => window.open('mailto:dpo@myheed.app?subject=Exerc%C3%ADcio%20de%20direitos%20RGPD','_blank')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 transition-colors"
          >
            <FaEnvelope className="w-5 h-5" />
            Contactar DPO
          </button>
        </div>
      </div>
      {/* Modal de confirmação de eliminação de conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200 relative">
            <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">⚠️ Eliminar Conta Permanentemente</h2>
            <p className="text-gray-700 mb-4">
              <b>ATENÇÃO: Esta ação é irreversível!</b><br/><br/>
              Ao eliminar a sua conta:<br/>
              <span className="text-red-600">✗ Todos os dados de pacientes serão perdidos<br/>
              ✗ Todas as notas e sessões serão eliminadas<br/>
              ✗ Todos os planos de tratamento serão perdidos<br/>
              ✗ Não poderá recuperar estes dados</span><br/><br/>
              <b>Recomendamos que exporte os seus dados antes de continuar.</b>
            </p>
            <label className="block mb-2 font-medium">Para confirmar, escreva <span className="font-mono bg-gray-100 px-2 py-1 rounded">ELIMINAR</span> na caixa abaixo:</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              disabled={deleting}
              autoFocus
            />
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                className="mr-2"
                checked={deleteChecked}
                onChange={e => setDeleteChecked(e.target.checked)}
                disabled={deleting}
              />
              Confirmo que fiz backup dos dados importantes
            </label>
            {deleteError && <div className="mb-3 text-red-600">{deleteError}</div>}
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); setDeleteChecked(false); setDeleteError(""); }}
                disabled={deleting}
              >Cancelar</button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                onClick={async () => { await deleteUserAccount(); }}
                disabled={deleting || deleteInput !== 'ELIMINAR' || !deleteChecked}
              >{deleting ? 'A eliminar...' : 'Eliminar Conta Permanentemente'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 