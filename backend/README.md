# Morada Premium - Backend API

Backend completo para o site da Morada Premium, desenvolvido com Node.js, Express e Supabase.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Supabase** - Banco de dados PostgreSQL e autenticação
- **Joi** - Validação de dados
- **Nodemailer** - Envio de emails
- **Helmet** - Segurança HTTP
- **Compression** - Compressão de respostas
- **Express Rate Limit** - Limitação de taxa de requisições
- **Jest** - Testes unitários
- **Nodemon** - Desenvolvimento com hot reload

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   └── app.js              # Configuração principal do Express
├── config/
│   └── supabase.js         # Configuração do Supabase
├── controllers/
│   ├── propertyController.js
│   ├── contactController.js
│   ├── visitController.js
│   └── chatController.js
├── middleware/
│   ├── errorHandler.js     # Tratamento de erros
│   ├── logger.js          # Log de requisições
│   └── validation.js      # Validação com Joi
├── models/
│   ├── Property.js
│   ├── Contact.js
│   ├── Visit.js
│   └── Chat.js
├── routes/
│   ├── properties.js
│   ├── contact.js
│   ├── visits.js
│   └── chat.js
├── services/
│   └── emailService.js    # Serviço de envio de emails
├── utils/
│   └── catchAsync.js      # Utilitários e tratamento de erros
├── tests/                 # Testes unitários
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json
├── server.js             # Ponto de entrada da aplicação
└── README.md
```

## ⚙️ Configuração

### 1. Instalação das Dependências

```bash
cd backend
npm install
```

### 2. Configuração das Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_KEY=sua_chave_de_servico

# Email (Nodemailer)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
ADMIN_EMAIL=admin@moradapremium.com

# JWT (para futuras implementações)
JWT_SECRET=seu_jwt_secret_muito_seguro
JWT_EXPIRES_IN=7d

# Upload (para futuras implementações)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configuração do Supabase

Crie as seguintes tabelas no seu projeto Supabase:

#### Tabela `properties`
```sql
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10,2),
  property_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

#### Tabela `contacts`
```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela `visits`
```sql
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20) NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabelas do Chat
```sql
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  close_reason VARCHAR(100)
);

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  message TEXT NOT NULL,
  sender_type VARCHAR(10) NOT NULL, -- 'user', 'bot', 'admin'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testes
```bash
npm test
```

## 📚 Endpoints da API

### Health Check
- `GET /health` - Verificar status da API

### Propriedades
- `GET /api/properties` - Listar propriedades com filtros
- `GET /api/properties/featured` - Propriedades em destaque
- `GET /api/properties/:id` - Buscar propriedade por ID
- `GET /api/properties/:id/similar` - Propriedades similares
- `POST /api/properties` - Criar propriedade (admin)
- `PUT /api/properties/:id` - Atualizar propriedade (admin)
- `DELETE /api/properties/:id` - Deletar propriedade (admin)
- `GET /api/properties/admin/stats` - Estatísticas (admin)

### Contato
- `POST /api/contact` - Enviar mensagem de contato
- `GET /api/contact` - Listar contatos (admin)
- `GET /api/contact/:id` - Buscar contato por ID (admin)
- `PUT /api/contact/:id/status` - Atualizar status (admin)
- `PUT /api/contact/:id/read` - Marcar como lido (admin)
- `POST /api/contact/:id/reply` - Responder contato (admin)
- `DELETE /api/contact/:id` - Deletar contato (admin)
- `GET /api/contact/admin/stats` - Estatísticas (admin)

### Visitas
- `POST /api/visits` - Agendar visita
- `GET /api/visits/availability` - Verificar disponibilidade
- `GET /api/visits/email/:email` - Buscar visitas por email
- `PUT /api/visits/:id/confirm` - Confirmar visita
- `PUT /api/visits/:id/cancel` - Cancelar visita
- `GET /api/visits` - Listar visitas (admin)
- `GET /api/visits/today` - Visitas do dia (admin)
- `GET /api/visits/:id` - Buscar visita por ID (admin)
- `PUT /api/visits/:id/status` - Atualizar status (admin)
- `PUT /api/visits/:id/reschedule` - Reagendar visita (admin)
- `DELETE /api/visits/:id` - Deletar visita (admin)
- `GET /api/visits/admin/stats` - Estatísticas (admin)

### Chat
- `POST /api/chat/session` - Iniciar sessão de chat
- `POST /api/chat/message` - Enviar mensagem
- `GET /api/chat/session/:sessionId` - Buscar sessão
- `GET /api/chat/session/:sessionId/messages` - Buscar mensagens
- `PUT /api/chat/session/:sessionId/close` - Fechar sessão
- `PUT /api/chat/session/:sessionId/transfer` - Transferir para humano
- `GET /api/chat/admin/sessions/active` - Sessões ativas (admin)
- `GET /api/chat/admin/sessions` - Todas as sessões (admin)
- `POST /api/chat/admin/session/:sessionId/message` - Mensagem manual (admin)
- `GET /api/chat/admin/stats` - Estatísticas (admin)

## 🔒 Segurança

- **Helmet** - Headers de segurança HTTP
- **CORS** - Controle de acesso entre origens
- **Rate Limiting** - Limitação de requisições por IP
- **Validação de dados** - Joi para validação de entrada
- **Sanitização** - Limpeza de dados sensíveis
- **Error Handling** - Tratamento seguro de erros

## 📧 Funcionalidades de Email

- Confirmação automática de contato
- Notificação de novos contatos para admin
- Confirmação de agendamento de visitas
- Notificação de novas visitas para admin
- Respostas personalizadas para contatos

## 🤖 Sistema de Chat

- Chat em tempo real com respostas automáticas
- Sessões de chat persistentes
- Transferência para atendimento humano
- Painel administrativo para gerenciar chats
- Estatísticas de atendimento

## 🧪 Testes

Para executar os testes:

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📝 Logs

A aplicação registra automaticamente:
- Todas as requisições HTTP
- Erros e exceções
- Inicialização de serviços
- Operações de banco de dados

## 🚀 Deploy

### Variáveis de Ambiente para Produção

Certifique-se de configurar todas as variáveis de ambiente necessárias no seu provedor de hospedagem.

### Comandos de Build

```bash
# Instalar dependências de produção
npm ci --only=production

# Iniciar aplicação
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico, entre em contato através do email: suporte@moradapremium.com

---

**Desenvolvido com ❤️ para Morada Premium**