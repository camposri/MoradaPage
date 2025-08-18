# 🚀 Guia de Configuração - Backend Morada Premium

## ✅ Status Atual
- ✅ Servidor funcionando na porta 3000
- ✅ Health check OK
- ❌ APIs precisam de configuração do Supabase

## 📋 Próximos Passos

### 1. Configurar Supabase

1. **Criar conta no Supabase:**
   - Acesse: https://supabase.com
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Obter credenciais:**
   - No dashboard do projeto, vá em Settings > API
   - Copie a `URL` e `anon key`

3. **Configurar variáveis de ambiente:**
   ```bash
   # Edite o arquivo .env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

4. **Criar tabelas no banco:**
   - No Supabase, vá em SQL Editor
   - Execute o arquivo `supabase-tables.sql`

### 2. Configurar Email (Opcional)

1. **Gmail com senha de app:**
   ```bash
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_de_app_gmail
   ```

2. **Ou usar outro provedor SMTP**

### 3. Testar APIs

Após configurar o Supabase:
```bash
node test-api.js
```

## 🔧 APIs Disponíveis

### Propriedades
- `GET /api/properties` - Buscar propriedades
- `GET /api/properties/featured` - Propriedades em destaque
- `GET /api/properties/:id` - Propriedade por ID
- `GET /api/properties/:id/similar` - Propriedades similares

### Contato
- `POST /api/contact` - Criar contato

### Visitas
- `POST /api/visits` - Agendar visita
- `GET /api/visits/availability` - Verificar disponibilidade

### Chat
- `POST /api/chat/session` - Iniciar sessão
- `POST /api/chat/message` - Enviar mensagem

## 🌐 URLs de Teste

- Health Check: http://localhost:3000/health
- API Base: http://localhost:3000/api

## 📝 Exemplo de Integração Frontend

```javascript
// Buscar propriedades
const response = await fetch('http://localhost:3000/api/properties?type=casa&page=1');
const data = await response.json();

// Enviar contato
const contactData = {
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(44) 99999-9999',
  message: 'Interesse em imóveis'
};

const response = await fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contactData)
});
```

## 🔒 Segurança

- Rate limiting: 100 req/15min por IP
- Helmet para headers de segurança
- Validação de dados com Joi
- CORS configurado

## 📊 Monitoramento

- Logs de requisições
- Health check endpoint
- Tratamento de erros