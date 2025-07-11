"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Button from '../../components/Button'
import ConsentManager from '../../components/ConsentManager'
import { FaDownload, FaTrashAlt, FaEnvelope, FaUserEdit, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Helper to get initials
const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase();
};

// Password strength validation function
function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
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
  const [activeTab, setActiveTab] = useState('info');
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(profile.email);
  const [editingPassword, setEditingPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempFirstName, setTempFirstName] = useState(profile.firstName);
  const [tempLastName, setTempLastName] = useState(profile.lastName);

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
        // Verificar e criar consentimentos default se não existirem
        const { data: consents, error: consentsError } = await supabase
          .from('user_consents')
          .select('id')
          .eq('user_id', user.id);
        if (!consentsError && (!consents || consents.length === 0)) {
          const defaultConsents = [
            {
              user_id: user.id,
              consent_type: 'essential',
              granted: true,
              granted_at: new Date().toISOString(),
              consent_version: '1.0',
            },
            {
              user_id: user.id,
              consent_type: 'health_data',
              granted: false,
              granted_at: new Date().toISOString(),
              consent_version: '1.0',
            },
            {
              user_id: user.id,
              consent_type: 'service_improvement',
              granted: false,
              granted_at: new Date().toISOString(),
              consent_version: '1.0',
            },
            {
              user_id: user.id,
              consent_type: 'communications',
              granted: false,
              granted_at: new Date().toISOString(),
              consent_version: '1.0',
            },
          ];
          await supabase.from('user_consents').insert(defaultConsents);
        }
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
      // 6. Eliminar conta de autenticação via API route
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao eliminar utilizador');
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Account Section */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Conta</h2>
        <div className="flex items-center gap-4 mb-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(profile.firstName, profile.lastName)}
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 min-w-[120px]">{profile.firstName} {profile.lastName}</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-right">
            <div>Criado em: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
            <div>Último acesso: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '-'}</div>
          </div>
        </div>
        <div className="border-t border-gray-200 my-6" />
        {/* Account Security Section */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Conta</h2>
        {/* Nome */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-gray-900">Nome</div>
            {!editingName ? (
              <div className="text-gray-600 text-sm">{profile.firstName} {profile.lastName}</div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={tempFirstName}
                  onChange={e => setTempFirstName(e.target.value)}
                  className="block w-full max-w-xs min-w-[120px] bg-gray-50 border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Primeiro nome"
                />
                <input
                  type="text"
                  value={tempLastName}
                  onChange={e => setTempLastName(e.target.value)}
                  className="block w-full max-w-xs min-w-[120px] bg-gray-50 border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Apelido"
                />
              </div>
            )}
          </div>
          {!editingName ? (
            <button className="border px-4 py-2 rounded text-sm font-medium" onClick={() => { setEditingName(true); setTempFirstName(profile.firstName); setTempLastName(profile.lastName); }}>Alterar nome</button>
          ) : (
            <div className="flex gap-2">
              <button
                className="border px-4 py-2 rounded text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={async () => {
                  setProfile({ ...profile, firstName: tempFirstName, lastName: tempLastName });
                  setEditingName(false);
                  await handleSave();
                }}
                disabled={!tempFirstName || !tempLastName}
              >Guardar</button>
              <button
                className="border px-4 py-2 rounded text-sm font-medium"
                onClick={() => { setEditingName(false); setTempFirstName(profile.firstName); setTempLastName(profile.lastName); }}
              >Cancelar</button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-gray-900">Email</div>
            {!editingEmail ? (
              <div className="text-gray-600 text-sm">{profile.email}</div>
            ) : (
              <input
                type="email"
                value={tempEmail}
                onChange={e => setTempEmail(e.target.value)}
                className="mt-1 block w-full max-w-xl min-w-[300px] bg-gray-50 border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
                placeholder="O seu email"
              />
            )}
          </div>
          {!editingEmail ? (
            <button className="border px-4 py-2 rounded text-sm font-medium" onClick={() => { setEditingEmail(true); setTempEmail(profile.email); }}>Alterar email</button>
          ) : (
            <div className="flex gap-2">
              <button
                className="border px-4 py-2 rounded text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={async () => {
                  setProfile({ ...profile, email: tempEmail });
                  setEditingEmail(false);
                  await handleSave();
                }}
              >Guardar</button>
              <button
                className="border px-4 py-2 rounded text-sm font-medium"
                onClick={() => { setEditingEmail(false); setTempEmail(profile.email); }}
              >Cancelar</button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-gray-900">Palavra-passe</div>
            <div className="text-gray-600 text-sm">Altere a sua palavra-passe para aceder à sua conta.</div>
            {passwordMessage && <div className="text-green-600 text-xs mt-1">{passwordMessage}</div>}
            {passwordError && <div className="text-red-600 text-xs mt-1">{passwordError}</div>}
            {editingPassword && tempPassword && !isStrongPassword(tempPassword) && (
              <div className="text-xs text-red-500 mt-1">
                A palavra-passe deve ter pelo menos 8 caracteres, uma maiúscula, uma minúscula, um número e um símbolo.
              </div>
            )}
          </div>
          {!editingPassword ? (
            <button className="border px-4 py-2 rounded text-sm font-medium" onClick={() => { setEditingPassword(true); setTempPassword(""); setPasswordMessage(""); setPasswordError(""); }}>Alterar palavra-passe</button>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="password"
                value={tempPassword}
                onChange={e => setTempPassword(e.target.value)}
                className="block w-full max-w-xl min-w-[300px] bg-gray-50 border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
                placeholder="Nova palavra-passe"
                disabled={passwordLoading}
              />
              <button
                className="border px-4 py-2 rounded text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={async () => {
                  setPasswordLoading(true);
                  setPasswordMessage("");
                  setPasswordError("");
                  try {
                    const { error } = await supabase.auth.updateUser({ password: tempPassword });
                    if (error) {
                      setPasswordError("Erro ao alterar palavra-passe: " + error.message);
                    } else {
                      setPasswordMessage("Palavra-passe alterada com sucesso!");
                      setEditingPassword(false);
                      setTempPassword("");
                    }
                  } catch (err) {
                    setPasswordError("Erro inesperado ao alterar palavra-passe.");
                  }
                  setPasswordLoading(false);
                }}
                disabled={!tempPassword || !isStrongPassword(tempPassword) || passwordLoading}
              >{passwordLoading ? 'A guardar...' : 'Guardar'}</button>
              <button
                className="border px-4 py-2 rounded text-sm font-medium"
                onClick={() => { setEditingPassword(false); setTempPassword(""); setPasswordMessage(""); setPasswordError(""); }}
                disabled={passwordLoading}
              >Cancelar</button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 my-6" />
        {/* Support Section */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Suporte</h2>
        <div className="flex flex-col gap-4 mb-8">
          {/* Transfer Data Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-gray-900">Transferir Dados</div>
              <div className="text-gray-600 text-sm">Faça download de todos os seus dados pessoais e clínicos num ficheiro JSON.</div>
            </div>
            <button
              onClick={exportUserData}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 transition-colors text-sm mt-2 sm:mt-0"
            >
              <FaDownload className="w-4 h-4" />
              {exporting ? 'A exportar...' : 'Transferir Dados'}
            </button>
          </div>
          {/* Delete Account Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-gray-900">Eliminar Conta</div>
              <div className="text-gray-600 text-sm">A sua conta e todos os dados associados serão eliminados permanentemente.</div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium border border-red-200 transition-colors text-sm mt-2 sm:mt-0"
            >
              <FaTrashAlt className="w-4 h-4" />
              Eliminar Conta
            </button>
          </div>
        </div>
        {/* Consentimentos RGPD in Support */}
        {user && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Consentimentos RGPD</h2>
            <ConsentManager userId={user.id} />
          </div>
        )}
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
    </div>
  )
} 