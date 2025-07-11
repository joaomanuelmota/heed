import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

console.log('SERVICE ROLE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('SUPABASE URL:', process.env.SUPABASE_URL);
// Create a Supabase client with the Service Role Key (only on server)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    // (Opcional) Aqui podes validar o utilizador autenticado
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro inesperado ao eliminar utilizador.' }, { status: 500 });
  }
} 