import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the Service Role Key (only on server)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A palavra-passe deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Keep email confirmation required
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Create essential consent
    const essentialConsent = {
      user_id: userId,
      consent_type: 'essential',
      granted: true,
      granted_at: new Date().toISOString(),
      consent_version: '1.0',
    }

    const { error: consentError } = await supabaseAdmin
      .from('user_consents')
      .insert([essentialConsent])

    if (consentError) {
      // If consent creation fails, we should still return success for user creation
      // but log the error for debugging
      console.error('Error creating consent:', consentError)
      
      return NextResponse.json({
        success: true,
        user: authData.user,
        warning: 'Conta criada, mas houve um erro ao registar consentimentos.'
      })
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: 'Conta criada com sucesso!'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 