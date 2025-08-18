# 🔧 Configuração de URLs para Deploy na Vercel

## 📋 Problema Identificado

Os erros que você está vendo:
```
net::ERR_FAILED https://sua-app.vercel.app/api/properties/search
Erro ao carregar propriedades: TypeError: Failed to fetch
```

Ocorrem porque o frontend está tentando acessar URLs que não correspondem à sua aplicação real na Vercel.

## ✅ Solução

### Opção 1: Configurar URL Específica (Recomendado)

Após fazer o deploy na Vercel e obter sua URL real:

```bash
# Substitua pela sua URL real da Vercel
npm run configure-url https://sua-app-real.vercel.app
```

### Opção 2: Configuração Automática na Vercel

A Vercel define automaticamente as variáveis de ambiente durante o build:
- `VERCEL_URL`: URL da aplicação
- `VERCEL_PROJECT_PRODUCTION_URL`: URL de produção

O script `build-vercel.js` já está configurado para usar essas variáveis automaticamente.

## 🚀 Fluxo de Deploy Recomendado

1. **Build Local com Placeholders**:
   ```bash
   npm run build:vercel
   ```

2. **Commit e Push**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push
   ```

3. **Deploy na Vercel**:
   - Conecte seu repositório à Vercel
   - Configure as variáveis de ambiente:
     - `BACKEND_URL`: URL do seu backend (ex: Railway, Heroku)
     - `NODE_ENV`: production

4. **Após o Deploy** (se necessário):
   ```bash
   # Use a URL real obtida da Vercel
   npm run configure-url https://sua-app-123abc.vercel.app
   git add .
   git commit -m "Update with real Vercel URL"
   git push
   ```

## 🔍 Verificação

Após o deploy, verifique se:
- ✅ A API proxy está funcionando: `https://sua-app.vercel.app/api/properties`
- ✅ O frontend carrega corretamente: `https://sua-app.vercel.app`
- ✅ As requisições não retornam erro 404 ou CORS

## 🛠️ Troubleshooting

### Se ainda houver erros de API:
1. Verifique se `BACKEND_URL` está configurado na Vercel
2. Confirme se o backend está rodando e acessível
3. Verifique os logs da função serverless na Vercel

### Para reverter para placeholders:
```bash
npm run build:vercel
```

## 📁 Arquivos Importantes

- `vercel.json`: Configuração da Vercel
- `api/index.js`: Função proxy para o backend
- `build-vercel.js`: Script de build para produção
- `configure-vercel-url.js`: Script para configurar URLs específicas