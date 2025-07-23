# Signup com Consentimento - Implementação

## 📋 Problema Resolvido

O problema original era que ao criar uma conta, o sistema tentava registar consentimentos na tabela `user_consents` imediatamente após o signup, mas como o utilizador não estava autenticado (precisa confirmar email), as políticas RLS (Row Level Security) bloqueavam a inserção.

## 🛠️ Solução Implementada

### 1. **Edge Function** (`supabase/functions/signup-with-consent/index.ts`)
- Usa Service Role Key para contornar RLS
- Cria utilizador e consentimento numa única operação atómica
- Validações robustas no servidor
- Auto-confirmação de email (configurável)

### 2. **API Route** (`app/api/signup-with-consent/route.js`)
- Fallback para desenvolvimento local
- Mesma funcionalidade da Edge Function
- Usa Service Role Key do Next.js

### 3. **Frontend Atualizado** (`app/signup/page.js`)
- Tenta primeiro a nova API route
- Fallback para o método antigo se falhar
- Mantém compatibilidade total

## 🚀 Como Usar

### Desenvolvimento Local
A API route já está funcionando. Basta testar o signup normalmente.

### Produção (Edge Function)
1. **Instalar Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Fazer login:**
   ```bash
   supabase login
   ```

3. **Deploy da Edge Function:**
   ```bash
   ./deploy-edge-function.sh
   ```

4. **Atualizar frontend para usar Edge Function:**
   ```javascript
   // Em vez de /api/signup-with-consent, usar:
   const response = await fetch('https://[PROJECT_REF].supabase.co/functions/v1/signup-with-consent', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
     },
     body: JSON.stringify({
       email: formData.email,
       password: formData.password,
       firstName: formData.firstName,
       lastName: formData.lastName,
     }),
   })
   ```

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
```env
# Para API Route (já configurado)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Para Edge Function (configurado no Supabase Dashboard)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Configurações da Edge Function
- **Email Confirmation**: Atualmente `email_confirm: true` (auto-confirma)
- **Para manter confirmação de email**: Mude para `email_confirm: false`

## 🔄 Fluxo de Funcionamento

1. **Utilizador preenche formulário de signup**
2. **Frontend chama API route/Edge Function**
3. **Servidor cria utilizador com Service Role Key**
4. **Servidor cria consentimento essencial**
5. **Retorna sucesso/erro para frontend**
6. **Se API route falhar, usa método antigo como fallback**

## 🛡️ Segurança

### ✅ Medidas Implementadas
- **Validação dupla**: Frontend + Servidor
- **Service Role Key**: Usado apenas no servidor
- **CORS configurado**: Para Edge Function
- **Error handling**: Tratamento robusto de erros
- **Fallback**: Método antigo como backup

### 🔒 Políticas RLS
A tabela `user_consents` mantém suas políticas RLS. A Edge Function/API route usa Service Role Key para contornar RLS apenas durante o signup.

## 🧪 Testes

### Testar API Route Local
```bash
curl -X POST http://localhost:3000/api/signup-with-consent \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

### Testar Edge Function (após deploy)
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/signup-with-consent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

## 🔄 Migração

### Para Produção
1. Deploy da Edge Function
2. Atualizar frontend para usar Edge Function
3. Testar fluxo completo
4. Remover API route se não for mais necessária

### Rollback
Se algo der errado, o fallback para o método antigo garante que o signup continue funcionando.

## 📝 Logs e Debugging

### API Route
- Logs aparecem no terminal do Next.js
- Erros são retornados ao frontend

### Edge Function
- Logs aparecem no Supabase Dashboard
- Erros são retornados ao frontend
- Console.log() funciona para debugging

## 🎯 Benefícios

1. **✅ Problema resolvido**: Consentimentos são criados corretamente
2. **🔄 Compatibilidade**: Código antigo continua funcionando
3. **🛡️ Segurança**: Validações robustas
4. **⚡ Performance**: Operação atómica
5. **🔧 Flexibilidade**: Fácil de modificar e estender
6. **📱 Escalabilidade**: Edge Function para produção

## 🚨 Notas Importantes

1. **Service Role Key**: Nunca exponha no frontend
2. **Email Confirmation**: Configurável na Edge Function
3. **Fallback**: Mantém compatibilidade
4. **Testes**: Sempre teste antes de deploy em produção
5. **Logs**: Monitore logs para debugging 