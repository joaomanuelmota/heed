'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Button from '../../components/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetPassword = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setMessage(`Erro: ${error.message}`)
      } else {
        setMessage('Email de recuperação enviado! Verifique a sua caixa de entrada.')
        setEmail('')
      }
    } catch (error) {
      setMessage(`Erro inesperado: ${error.message}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Recuperar Palavra-passe
            </h2>
            <p className="text-gray-600">
              Introduza o seu email para receber instruções de recuperação.
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 mb-6 rounded-lg text-sm ${
              message.includes('enviado') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
              required
              disabled={loading}
            />
          </div>

          {/* Reset Password Button */}
          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                A enviar...
              </div>
            ) : (
              'Enviar Email de Recuperação'
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