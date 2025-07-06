# Guia de Deploy para Produção - Heed

## 🚀 Deploy com Vercel (Recomendado)

### Passo 1: Preparar o Projeto
1. Certifica-te de que tudo está commitado no GitHub
2. Verifica se o projeto builda localmente:
   ```bash
   npm run build
   ```

### Passo 2: Deploy no Vercel
1. Vai a [vercel.com](https://vercel.com)
2. Clica "New Project"
3. Importa o repositório do GitHub
4. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
5. Clica "Deploy"

### Passo 3: Obter URL de Produção
- Após deploy, obténs uma URL como: `https://heed-abc123.vercel.app`
- Esta será a tua **URL de produção**

## 🔧 Configurar Google Auth para Produção

### Passo 1: Atualizar Google Cloud Console
1. Vai a [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Edita o teu OAuth 2.0 Client ID
4. **Authorized JavaScript origins**, adiciona:
   ```
   https://heed-abc123.vercel.app
   https://[YOUR_PROJECT_REF].supabase.co
   ```
5. **Authorized redirect URIs**, adiciona:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   https://heed-abc123.vercel.app/auth/callback
   ```

### Passo 2: Atualizar Supabase
1. Vai ao teu projeto Supabase
2. **Authentication** → **URL Configuration**
3. **Site URL**: `https://heed-abc123.vercel.app`
4. **Redirect URLs**:
   ```
   https://heed-abc123.vercel.app/dashboard
   https://heed-abc123.vercel.app/auth/callback
   ```

## 🌐 Configurar Domínio Customizado (Opcional)

### Passo 1: Comprar Domínio
- **Recomendações**: 
  - `heed.pt` (Portugal)
  - `meu-psicologo.com`
  - `heed-app.com`

### Passo 2: Configurar no Vercel
1. No dashboard do Vercel, vai a **Settings** → **Domains**
2. Adiciona o teu domínio
3. Configura os registos DNS conforme indicado

### Passo 3: Atualizar Google Auth
1. No Google Cloud Console, adiciona o domínio às **Authorized JavaScript origins**
2. No Supabase, atualiza as URLs para usar o domínio customizado

## 🔒 Variáveis de Ambiente

### Configurar no Vercel
1. No dashboard do Vercel, vai a **Settings** → **Environment Variables**
2. Adiciona:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Verificar no Código
Certifica-te de que o `lib/supabase.js` usa as variáveis de ambiente:
```javascript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📱 Testar Produção

### Checklist de Testes
- [ ] Página inicial carrega
- [ ] Login com email funciona
- [ ] Login com Google funciona
- [ ] Registar nova conta funciona
- [ ] Dashboard carrega após login
- [ ] Todas as funcionalidades principais funcionam
- [ ] Responsive design funciona em mobile

### Testar em Diferentes Dispositivos
- Desktop (Chrome, Firefox, Safari)
- Mobile (iOS Safari, Android Chrome)
- Tablet (iPad, Android)

## 🚨 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifica se as URLs no Google Cloud Console correspondem exatamente às do Supabase
- Inclui tanto `http://localhost:3000` (dev) como a URL de produção

### Erro: "Build Failed"
- Verifica os logs no Vercel
- Testa `npm run build` localmente
- Verifica se todas as dependências estão instaladas

### Erro: "Environment Variables Missing"
- Verifica se as variáveis estão configuradas no Vercel
- Reinicia o deploy após adicionar variáveis

## 📊 Monitorização

### Vercel Analytics
1. Ativa Vercel Analytics no dashboard
2. Monitoriza performance e erros
3. Configura alertas se necessário

### Supabase Monitoring
1. Vai a **Dashboard** → **Logs**
2. Monitoriza autenticação e queries
3. Configura alertas para erros

## 🔄 Deploy Automático

### GitHub Integration
- Cada push para `main` faz deploy automático
- Pull requests criam preview deployments
- Configura branch protection se necessário

### Custom Domains
- Configura SSL automático
- Configura redirects se necessário
- Monitoriza uptime

## 📈 Próximos Passos

### Após Deploy
1. **Testa tudo** em produção
2. **Configura monitorização**
3. **Prepara documentação** para utilizadores
4. **Configura backup** da base de dados
5. **Planeia scaling** se necessário

### Marketing
1. **SEO optimization**
2. **Google Analytics**
3. **Social media** presence
4. **User onboarding** flow

---

**Nota**: Este guia assume que já tens o projeto no GitHub. Se não tiveres, faz push primeiro:
```bash
git add .
git commit -m "Preparação para deploy"
git push origin main
``` 