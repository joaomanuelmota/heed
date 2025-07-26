'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Button from '../../components/Button'
import { analytics } from '../../lib/analytics';
import { useEffect } from 'react';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}



export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  const router = useRouter()

  useEffect(() => {
    analytics.signupStarted();
  }, []);



  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Por favor, insira o nome.'
    if (!formData.lastName.trim()) newErrors.lastName = 'Por favor, insira o apelido.'
    if (!validarEmail(formData.email)) newErrors.email = 'Por favor, insira um email válido.'
    if (!formData.password) newErrors.password = 'Por favor, insira a palavra-passe.'
    else if (formData.password.length < 6) newErrors.password = 'A palavra-passe deve ter pelo menos 6 caracteres.'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Por favor, confirme a palavra-passe.'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As palavras-passe não coincidem.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSignUp = async () => {
    setMessage('')
    if (!validate()) return
    setLoading(true)
    setMessage('')
    try {
      // Try the new API route first
      const response = await fetch('/api/signup-with-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(`Erro: ${result.error}`)
      } else {
        analytics.signupCompleted('email');
        
        if (result.warning) {
          setMessage(result.warning);
        } else {
          setMessage('Sucesso! Por favor, verifique o seu email para confirmar a conta.');
        }
        
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      // Fallback to old method if API route fails
      console.log('API route failed, trying fallback method:', error);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: `${formData.firstName} ${formData.lastName}`
            }
          }
        })
        if (signUpError) {
          setMessage(`Erro: ${signUpError.message}`)
        } else {
          analytics.signupCompleted('email');
          setMessage('Sucesso! Por favor, verifique o seu email para confirmar a conta.');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
          })
        }
      } catch (fallbackError) {
        setMessage(`Erro inesperado: ${fallbackError.message}`)
      }
    }
    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        setMessage(`Erro: ${error.message}`)
      } else {
        analytics.signupCompleted('google');
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }
  }

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    validarEmail(formData.email) &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    !loading

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Experimente 30 Dias Grátis
            </h2>
            <p className="text-gray-600">
              Sem compromisso, cancele quando quiser!
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 mb-6 rounded-lg text-sm ${
              message.toLowerCase().includes('sucesso')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}



          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registar com Google
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

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="signup-firstName" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  id="signup-firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nome"
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${errors.firstName ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                  required
                  disabled={loading}
                  onBlur={() => {
                    if (!formData.firstName.trim()) setErrors(e => ({ ...e, firstName: 'Por favor, insira o nome.' }))
                    else setErrors(e => ({ ...e, firstName: '' }))
                  }}
                />
                {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
              </div>
              <div>
                <label htmlFor="signup-lastName" className="block text-sm font-medium text-gray-700">Apelido</label>
                <input
                  id="signup-lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Apelido"
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${errors.lastName ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                  required
                  disabled={loading}
                  onBlur={() => {
                    if (!formData.lastName.trim()) setErrors(e => ({ ...e, lastName: 'Por favor, insira o apelido.' }))
                    else setErrors(e => ({ ...e, lastName: '' }))
                  }}
                />
                {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mt-4">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${errors.email ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                required
                disabled={loading}
                onBlur={() => {
                  if (!validarEmail(formData.email)) setErrors(e => ({ ...e, email: 'Por favor, insira um email válido.' }))
                  else setErrors(e => ({ ...e, email: '' }))
                }}
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mt-4">Palavra-passe</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Palavra-passe"
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${errors.password ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                required
                disabled={loading}
                onBlur={() => {
                  if (!formData.password) setErrors(e => ({ ...e, password: 'Por favor, insira a palavra-passe.' }))
                  else if (formData.password.length < 6) setErrors(e => ({ ...e, password: 'A palavra-passe deve ter pelo menos 6 caracteres.' }))
                  else setErrors(e => ({ ...e, password: '' }))
                }}
              />
              {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar palavra-passe"
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 border ${errors.confirmPassword ? 'border-red-200 bg-red-50' : 'border-gray-300'}`}
                required
                disabled={loading}
                onBlur={() => {
                  if (!formData.confirmPassword) setErrors(e => ({ ...e, confirmPassword: 'Por favor, confirme a palavra-passe.' }))
                  else if (formData.password !== formData.confirmPassword) setErrors(e => ({ ...e, confirmPassword: 'As palavras-passe não coincidem.' }))
                  else setErrors(e => ({ ...e, confirmPassword: '' }))
                }}
              />
              {errors.confirmPassword && <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>}
            </div>
          </div>

          {/* Register Button */}
          <Button
            onClick={handleSignUp}
            disabled={!isFormValid}
            className="w-full py-3 px-4 mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                A registar...
              </div>
            ) : (
              'Registar'
            )}
          </Button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Iniciar Sessão
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ao clicar em &quot;Registar&quot;, concorda com os nossos{' '}
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
