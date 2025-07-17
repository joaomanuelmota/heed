'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Button from '../../components/Button'

function validarEmail(email) {
  // Regex simples para email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userName, setUserName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || 'User')
      }
    }
    fetchUser()
  }, [])

  const handleLogin = async () => {
    setMessage('')
    let valid = true
    // Validação frontend
    if (!validarEmail(email)) {
      setEmailError('Por favor, insira um email válido.')
      valid = false
    } else {
      setEmailError('')
    }
    if (!password) {
      setPasswordError('Por favor, insira a palavra-passe.')
      valid = false
    } else {
      setPasswordError('')
    }
    if (!valid) return

    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) {
        setMessage(`Erro: ${error.message}`)
      } else {
        setMessage('Login efetuado com sucesso!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        setMessage(`Erro no login com Google: ${error.message}`)
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }
    setLoading(false)
  }

  const isFormValid = validarEmail(email) && password && !loading

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-600">
              Inicie sessão com Google ou email.
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 mb-6 rounded-lg text-sm ${
              message.toLowerCase().includes('sucesso') || message.toLowerCase().includes('success')
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'A processar...' : 'Continuar com Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Ou continuar com</span>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${emailError ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
              required
              disabled={loading}
              onBlur={() => {
                if (!validarEmail(email)) setEmailError('Por favor, insira um email válido.')
                else setEmailError('')
              }}
            />
            {emailError && <div className="text-red-500 text-xs mt-1">{emailError}</div>}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mt-4">Palavra-passe</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Palavra-passe"
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${passwordError ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
              required
              disabled={loading}
              onBlur={() => {
                if (!password) setPasswordError('Por favor, insira a palavra-passe.')
                else setPasswordError('')
              }}
            />
            {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Esqueceu a palavra-passe?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!isFormValid}
            className="w-full py-3 px-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                A entrar...
              </div>
            ) : (
              'Entrar'
            )}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Registar aqui
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ao clicar em &quot;Entrar&quot;, concorda com os nossos{' '}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800"
            >
              Termos de Serviço
            </Link>
            {' '}e{' '}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-800"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
} 