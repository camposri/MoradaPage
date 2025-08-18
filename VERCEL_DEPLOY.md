# 🚀 Deploy na Vercel - Morada Premium

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Repositório Git**: Código deve estar em um repositório (GitHub, GitLab, Bitbucket)
3. **Supabase configurado**: Database e variáveis de ambiente prontas

## 🔧 Configuração do Projeto

### 1. Estrutura Preparada
```
morada-premium/
├── api/
│   └── index.js          # Serverless function principal
├── backend/              # Código do backend (usado pela API)
├── index.html           # Frontend principal
├── admin.html           # Painel administrativo
├── vercel.json          # Configuração da Vercel
├── package.json         # Dependências e scripts
└── .vercelignore        # Arquivos a ignorar no deploy
```

### 2. Arquivos de Configuração Criados
- ✅ `vercel.json` - Configuração de rotas e builds
- ✅ `api/index.js` - Entry point serverless
- ✅ `.vercelignore` - Exclusões do deploy
- ✅ `build-vercel.js` - Script de build para produção

## 🚀 Passos para Deploy

### 1. Preparar Repositório
```bash
git add .
git commit -m "Configuração para deploy na Vercel"
git push origin main
```

### 2. Conectar à Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório Git
4. Selecione o repositório `morada-premium`

### 3. Configurar Variáveis de Ambiente
No painel da Vercel, adicione estas variáveis:

#### Supabase
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

#### Email (Nodemailer)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=seu_email@gmail.com
```

#### Configurações Gerais
```
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_super_seguro
FRONTEND_URL=https://seu-dominio.vercel.app
```

### 4. Deploy Automático
- A Vercel fará o deploy automaticamente
- O build usará o script `vercel-build` do package.json
- URLs serão atualizadas automaticamente

## 🔍 Verificação Pós-Deploy

### 1. Testar Endpoints
- `https://seu-app.vercel.app/` - Frontend
- `https://seu-app.vercel.app/admin` - Painel admin
- `https://seu-app.vercel.app/api/health` - Health check da API

### 2. Funcionalidades a Testar
- ✅ Busca de propriedades
- ✅ Formulário de contato
- ✅ Agendamento de visitas
- ✅ Chatbot com redirecionamento WhatsApp
- ✅ Painel administrativo

## 🛠️ Comandos Úteis

### Build Local (Teste)
```bash
npm run build:vercel
```

### Desenvolvimento Local
```bash
npm run dev
```

### Instalar Dependências Backend
```bash
npm run install-backend
```

## 🔧 Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no `package.json` raiz
- Execute `npm install` na raiz do projeto

### Erro: "Function timeout"
- Aumente `maxDuration` no `vercel.json`
- Otimize consultas ao Supabase

### Erro: "CORS"
- Verifique `FRONTEND_URL` nas variáveis de ambiente
- Confirme configuração CORS no `app.js`

### Erro: "Database connection"
- Verifique variáveis do Supabase
- Teste conexão local primeiro

## 📱 Domínio Personalizado

1. No painel Vercel, vá em "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções
4. Atualize `FRONTEND_URL` com novo domínio

## 🔄 Atualizações

Para atualizar o projeto:
1. Faça alterações no código
2. Commit e push para o repositório
3. Vercel fará redeploy automaticamente

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

✅ **Projeto configurado e pronto para deploy na Vercel!**