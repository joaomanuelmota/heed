#!/bin/bash

# Script para fazer deploy da Edge Function do Supabase
# Uso: ./deploy-edge-function.sh

echo "🚀 Fazendo deploy da Edge Function signup-with-consent..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Não está logado no Supabase. Execute: supabase login"
    exit 1
fi

# Fazer deploy da Edge Function
echo "📦 Fazendo deploy..."
supabase functions deploy signup-with-consent

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployada com sucesso!"
    echo "🌐 URL: https://[PROJECT_REF].supabase.co/functions/v1/signup-with-consent"
    echo ""
    echo "📝 Para usar a Edge Function em produção, atualize o frontend para chamar:"
    echo "   fetch('https://[PROJECT_REF].supabase.co/functions/v1/signup-with-consent', ...)"
else
    echo "❌ Erro no deploy da Edge Function"
    exit 1
fi 