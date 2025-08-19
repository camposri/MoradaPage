# MoradaPage Backend

Backend completo para sistema de imobiliária construído com Next.js 14 e Supabase.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **Tailwind CSS** - Framework CSS utilitário

## 📋 Funcionalidades

### 🏠 Gestão de Propriedades
- ✅ CRUD completo de propriedades
- ✅ Busca avançada com filtros
- ✅ Upload de imagens
- ✅ Propriedades em destaque

### 📞 Sistema de Contatos
- ✅ Recebimento de mensagens de contato
- ✅ Gestão de status (lido/não lido)
- ✅ Busca e filtros

### 📅 Agendamento de Visitas
- ✅ Agendamento de visitas às propriedades
- ✅ Gestão de status (pendente, confirmado, cancelado, concluído)
- ✅ Reagendamento de visitas
- ✅ Validação de conflitos de horário

### 🔐 Autenticação
- ✅ Sistema de login administrativo
- ✅ Middleware de proteção de rotas
- ✅ Tokens de autenticação

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta na Vercel (para deploy)

### 2. Clonagem e Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd backend

# Instale as dependências
npm install
```

### 3. Configuração do Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Vá para Settings > API para obter suas chaves
3. Execute o script SQL em `supabase/schema.sql` no SQL Editor do Supabase

### 4. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura

# Next.js Configuration
NEXTAUTH_SECRET=seu_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 5. Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

Para rotas administrativas, inclua o header:
```
Authorization: Bearer <token>
```

Obtenha o token através do endpoint de login.

### Endpoints

#### 🔐 Autenticação

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "sua_senha"
}
```

#### 🏠 Propriedades

**GET** `/api/properties` - Listar propriedades
- Query params: `page`, `limit`, `type`, `city`, `featured`

**POST** `/api/properties` - Criar propriedade (Admin)
```json
{
  "title": "Casa Moderna",
  "type": "casa",
  "price": 450000,
  "area": 120,
  "bedrooms": 3,
  "bathrooms": 2,
  "location": "São Paulo, SP",
  "description": "Descrição da propriedade",
  "main_image": "/uploads/image.jpg",
  "additional_images": ["/uploads/image2.jpg"],
  "featured": false
}
```

**GET** `/api/properties/search` - Busca avançada
- Query params: `type`, `city`, `min_price`, `max_price`, `min_area`, `max_area`, `bedrooms`, `bathrooms`, `search`

**GET** `/api/properties/[id]` - Obter propriedade específica

**PUT** `/api/properties/[id]` - Atualizar propriedade (Admin)

**DELETE** `/api/properties/[id]` - Excluir propriedade (Admin)

#### 📞 Contatos

**GET** `/api/contact` - Listar contatos (Admin)
- Query params: `page`, `limit`, `status`, `search`

**POST** `/api/contact` - Enviar mensagem de contato
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "subject": "Interesse em propriedade",
  "message": "Gostaria de mais informações"
}
```

**GET** `/api/contact/[id]` - Obter contato específico (Admin)

**PUT** `/api/contact/[id]` - Atualizar status do contato (Admin)
```json
{
  "status": "read"
}
```

**DELETE** `/api/contact/[id]` - Excluir contato (Admin)

#### 📅 Visitas

**GET** `/api/visits` - Listar visitas (Admin)
- Query params: `page`, `limit`, `status`, `property_id`, `search`

**POST** `/api/visits` - Agendar visita
```json
{
  "property_id": "uuid",
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "(11) 88888-8888",
  "visit_date": "2024-02-15",
  "visit_time": "14:30",
  "message": "Mensagem opcional"
}
```

**GET** `/api/visits/[id]` - Obter visita específica (Admin)

**PUT** `/api/visits/[id]` - Atualizar visita (Admin)
```json
{
  "status": "confirmed",
  "visit_date": "2024-02-16",
  "visit_time": "15:00",
  "admin_notes": "Notas administrativas"
}
```

**DELETE** `/api/visits/[id]` - Excluir visita (Admin)

#### 📁 Upload de Arquivos

**POST** `/api/upload` - Upload de imagens (Admin)
- Content-Type: `multipart/form-data`
- Field: `files` (aceita múltiplos arquivos)
- Formatos aceitos: JPEG, PNG, WebP
- Tamanho máximo: 5MB por arquivo

**DELETE** `/api/upload?filename=nome_arquivo` - Excluir arquivo (Admin)

## 🗄️ Estrutura do Banco de Dados

### Tabela: properties
- `id` (UUID, PK)
- `title` (VARCHAR)
- `type` (VARCHAR) - casa, apartamento, terreno, comercial
- `price` (DECIMAL)
- `area` (INTEGER) - em m²
- `bedrooms` (INTEGER)
- `bathrooms` (INTEGER)
- `location` (VARCHAR)
- `description` (TEXT)
- `main_image` (VARCHAR)
- `additional_images` (JSON)
- `featured` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela: contacts
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `subject` (VARCHAR)
- `message` (TEXT)
- `status` (VARCHAR) - read, unread
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela: visits
- `id` (UUID, PK)
- `property_id` (UUID, FK)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `visit_date` (DATE)
- `visit_time` (TIME)
- `message` (TEXT)
- `status` (VARCHAR) - pending, confirmed, cancelled, completed
- `admin_notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔒 Segurança

- Row Level Security (RLS) habilitado no Supabase
- Middleware de autenticação para rotas administrativas
- Validação de dados em todas as rotas
- Sanitização de uploads de arquivos
- Tokens de autenticação para acesso administrativo

## 🚀 Deploy na Vercel

### 1. Preparação do Repositório

```bash
# Inicialize o Git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit"

# Conecte ao repositório remoto (GitHub/GitLab)
git remote add origin <seu-repositorio-url>
git push -u origin main
```

### 2. Deploy na Vercel

#### Opção 1: Via Dashboard da Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte seu repositório GitHub/GitLab
4. Selecione o projeto MoradaPage
5. Configure as variáveis de ambiente (veja seção abaixo)
6. Clique em "Deploy"

#### Opção 2: Via CLI da Vercel
```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy do projeto
vercel
```

### 3. Configuração de Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em Settings > Environment Variables e adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
NEXTAUTH_SECRET=sua_chave_secreta_nextauth
NEXTAUTH_URL=https://seu-app.vercel.app
```

### 4. Configurações Automáticas

O projeto já inclui:
- ✅ `vercel.json` - Configurações específicas da Vercel
- ✅ `next.config.ts` - Otimizado para produção
- ✅ `.env.example` - Template das variáveis de ambiente

### 5. Verificação do Deploy

Após o deploy:
1. Teste as rotas da API: `https://seu-app.vercel.app/api/properties`
2. Verifique o funcionamento do upload de imagens
3. Teste a autenticação administrativa

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificar código com ESLint
npm run type-check   # Verificar tipos TypeScript
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

Para dúvidas ou suporte, entre em contato através do email: suporte@moradapage.com

---

**MoradaPage Backend** - Sistema completo para imobiliárias 🏠
