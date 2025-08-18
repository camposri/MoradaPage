# 🚀 Guia de Deploy - Morada Premium

## Opções de Deploy

### 1. Deploy Rápido com Vercel + Railway

#### Frontend (Vercel)
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure:
   - Build Command: `echo "Static files ready"`
   - Output Directory: `./`
   - Install Command: `npm install`

#### Backend (Railway)
1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório
3. Configure as variáveis de ambiente:
   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://seu-dominio.vercel.app
   SUPABASE_URL=sua_url
   SUPABASE_ANON_KEY=sua_chave
   EMAIL_USER=valmikejunior@creci.org.br
   EMAIL_PASS=senha_do_app
   ADMIN_EMAIL=valmikejunior@creci.org.br
   ```
4. Deploy automático do diretório `backend/`

### 2. Deploy com Netlify + Render

#### Frontend (Netlify)
1. Arraste a pasta do projeto para [netlify.com](https://netlify.com)
2. Ou conecte via GitHub

#### Backend (Render)
1. Acesse [render.com](https://render.com)
2. Crie um Web Service
3. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### 3. Deploy Tradicional (VPS)

```bash
# No servidor
sudo apt update
sudo apt install nodejs npm nginx

# Clone o projeto
git clone <seu-repositorio>
cd MoradaPage

# Instalar dependências
npm run install-backend

# Configurar PM2
npm install -g pm2
pm2 start backend/server.js --name morada-premium

# Configurar Nginx
sudo nano /etc/nginx/sites-available/morada-premium
```

#### Configuração Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    # Frontend
    location / {
        root /path/to/MoradaPage;
        index index.html;
        try_files $uri $uri/ =404;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ Checklist Pré-Deploy

- [ ] Configurar variáveis de ambiente
- [ ] Testar conexão com Supabase
- [ ] Configurar email (senha de aplicativo)
- [ ] Testar formulários de contato
- [ ] Verificar redirecionamento WhatsApp
- [ ] Testar painel administrativo
- [ ] Configurar domínio personalizado
- [ ] Configurar SSL/HTTPS

## 🔧 Configurações Pós-Deploy

1. **Atualizar URLs no Frontend**:
   - Substitua `http://localhost:3000` pela URL do backend em produção
   - Atualize em `index.html` e `admin.html`

2. **Configurar CORS**:
   - Atualize `FRONTEND_URL` no `.env` do backend

3. **Testar Funcionalidades**:
   - Formulário de contato
   - Agendamento de visitas
   - Painel administrativo
   - Chatbot WhatsApp

## 🆘 Solução de Problemas

### Erro de CORS
```javascript
// No backend/src/app.js, verifique:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));
```

### Erro de Email
- Verifique se a senha de aplicativo está correta
- Confirme se a autenticação de 2 fatores está ativa

### Erro de Conexão com Banco
- Verifique as credenciais do Supabase
- Confirme se as tabelas foram criadas

## 📱 URLs Importantes

- **Frontend**: Sua URL principal
- **Backend**: Sua URL da API
- **Admin**: `sua-url.com/admin.html`
- **WhatsApp**: `https://wa.me/5544991645526`

---

**Suporte**: valmikejunior@creci.org.br