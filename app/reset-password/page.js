'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Button from '../../components/Button'

function validarPassword(p, c) {
  if (!p || !c) return 'A palavra-passe é obrigatória.'
  if (p.length < 6) return 'A palavra-passe deve ter pelo menos 6 caracteres.'
  if (p !== c) return 'As palavras-passe não coincidem.'
  return ''
}

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    // Verificar se há uma sessão válida de recuperação
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        setMessage('Link inválido ou expirado. Por favor, solicite um novo link de recuperação.')
      }
    }
    
    checkSession()
  }, [])

  const handleResetPassword = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    const validation = validarPassword(password, confirmPassword)
    if (validation) {
      setError(validation)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setMessage(`Erro: ${error.message}`)
      } else {
        setMessage('Palavra-passe alterada com sucesso! A redirecionar para o login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }

    setLoading(false)
  }

  if (!isValidSession && message.includes('Link inválido')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Link Inválido
              </h2>
              <p className="text-gray-600 mb-6">
                O link de recuperação é inválido ou expirou.
              </p>
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Solicitar novo link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Nova Palavra-passe
            </h2>
            <p className="text-gray-600">
              Introduza a sua nova palavra-passe.
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 mb-6 rounded-lg text-sm ${
              message.includes('sucesso') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Nova palavra-passe"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 ${error && error.includes('palavra-passe') ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
              required
              disabled={loading}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
              placeholder="Confirmar nova palavra-passe"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 ${error && error.includes('coincidem') ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>

          {/* Reset Password Button */}
          <Button
            onClick={handleResetPassword}
            disabled={loading || !!validarPassword(password, confirmPassword)}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                A alterar...
              </div>
            ) : (
              'Alterar Palavra-passe'
            )}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Lembra-se da palavra-passe?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Voltar ao Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 