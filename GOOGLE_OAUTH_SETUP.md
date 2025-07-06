# Configuração do Login com Google - Supabase

## Passo 1: Configurar Google Cloud Console

### 1.1 Criar/Selecionar Projeto
1. Vai a [console.cloud.google.com](https://console.cloud.google.com)
2. Cria um novo projeto ou seleciona um existente
3. Anota o **Project ID** (vais precisar dele)

### 1.2 Ativar APIs
1. Vai a **"APIs & Services"** → **"Library"**
2. Procura e ativa:
   - **Google+ API** (ou Google Identity API)
   - **Google Identity and Access Management (IAM) API**

### 1.3 Criar Credenciais OAuth
1. Vai a **"APIs & Services"** → **"Credentials"**
2. Clica **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Se for a primeira vez, configura o consentimento OAuth:
   - **User Type**: External
   - **App name**: Heed
   - **User support email**: teu email
   - **Developer contact information**: teu email

### 1.4 Configurar OAuth Client
1. **Application type**: Web application
2. **Name**: Heed Web Client
3. **Authorized JavaScript origins**:
   ```
   https://[YOUR_PROJECT_REF].supabase.co
   http://localhost:3000 (para desenvolvimento)
   ```
4. **Authorized redirect URIs**:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (para desenvolvimento)
   ```

### 1.5 Obter Credenciais
- Anota o **Client ID** e **Client Secret**
- Guarda-os em segurança (vais precisar deles no próximo passo)

## Passo 2: Configurar Supabase

### 2.1 Aceder ao Dashboard
1. Vai ao teu projeto no [supabase.com](https://supabase.com)
2. Navega para **"Authentication"** → **"Providers"**

### 2.2 Ativar Google Provider
1. Encontra **"Google"** na lista de providers
2. Clica no toggle para **ativar**
3. Preenche os campos:
   - **Client ID**: O Client ID do Google Cloud Console
   - **Client Secret**: O Client Secret do Google Cloud Console
4. Clica **"Save"**

### 2.3 Configurar URLs de Redirecionamento
No Supabase, vai a **"Authentication"** → **"URL Configuration"**:
- **Site URL**: `http://localhost:3000` (desenvolvimento) ou `https://teu-dominio.com` (produção)
- **Redirect URLs**: 
  ```
  http://localhost:3000/dashboard
  https://teu-dominio.com/dashboard
  ```

## Passo 3: Testar a Configuração

### 3.1 Teste Local
1. Inicia o servidor de desenvolvimento: `npm run dev`
2. Vai a `http://localhost:3000/login`
3. Clica no botão "Continuar com Google"
4. Deves ser redirecionado para o Google para autorização
5. Após autorizar, deves voltar para `/dashboard`

### 3.2 Verificar Logs
- No Supabase Dashboard, vai a **"Authentication"** → **"Logs"**
- Verifica se há erros relacionados com o Google OAuth

## Passo 4: Configuração para Produção

### 4.1 Atualizar URLs
Quando fizeres deploy:
1. No Google Cloud Console, adiciona o teu domínio às **Authorized JavaScript origins**
2. No Supabase, atualiza as **Site URL** e **Redirect URLs**
3. Remove as URLs de localhost se não precisares delas

### 4.2 Configurar Domínio
Se usares um domínio customizado:
1. Adiciona o domínio ao Google Cloud Console
2. Configura o Supabase para usar o teu domínio
3. Testa o fluxo completo

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifica se as URLs no Google Cloud Console correspondem exatamente às do Supabase
- Inclui `http://localhost:3000` para desenvolvimento

### Erro: "invalid_client"
- Verifica se o Client ID e Client Secret estão corretos
- Certifica-te de que copiaste as credenciais sem espaços extras

### Erro: "access_denied"
- Verifica se a Google+ API está ativada
- Confirma que o consentimento OAuth está configurado

### O botão não funciona
- Verifica a consola do browser para erros JavaScript
- Confirma que o Supabase está configurado corretamente
- Verifica se o provider Google está ativado no Supabase

## Segurança

### Boas Práticas
1. **Nunca partilhes** o Client Secret
2. **Usa variáveis de ambiente** para as credenciais
3. **Configura HTTPS** em produção
4. **Monitoriza os logs** de autenticação
5. **Configura domínios permitidos** corretamente

### Variáveis de Ambiente (Opcional)
Se quiseres usar variáveis de ambiente:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Próximos Passos

Após configurar o Google OAuth:
1. Testa o fluxo completo de login/logout
2. Configura o tratamento de dados do utilizador
3. Implementa logout com Google
4. Considera adicionar outros providers (GitHub, etc.)
5. Configura notificações de segurança

---

**Nota**: Este guia assume que já tens o Supabase configurado no teu projeto. Se precisares de ajuda com a configuração inicial do Supabase, consulta a [documentação oficial](https://supabase.com/docs). 