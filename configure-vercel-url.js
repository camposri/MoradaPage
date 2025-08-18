const fs = require('fs');
const path = require('path');

// Script para configurar a URL real da aplicação Vercel
// Uso: node configure-vercel-url.js https://sua-app-real.vercel.app

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Erro: URL da aplicação Vercel não fornecida');
  console.log('📝 Uso: node configure-vercel-url.js https://sua-app-real.vercel.app');
  process.exit(1);
}

const VERCEL_APP_URL = args[0].replace(/https?:\/\//, '').replace(/\/$/, '');
const API_URL = `https://${VERCEL_APP_URL}/api`;
const FRONTEND_URL = `https://${VERCEL_APP_URL}`;

console.log('🔧 Configurando URLs da aplicação Vercel...');
console.log(`📋 URL da aplicação: ${FRONTEND_URL}`);
console.log(`📋 URL da API: ${API_URL}`);

// Função para atualizar URLs nos arquivos HTML
function updateHtmlFile(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituir placeholder URLs
    content = content.replace(/https:\/\/YOUR_VERCEL_APP_URL\/api/g, API_URL);
    content = content.replace(/https:\/\/YOUR_VERCEL_APP_URL/g, FRONTEND_URL);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${fileName} atualizado com URLs reais`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${fileName}:`, error.message);
  }
}

// Atualizar arquivos HTML
updateHtmlFile('./index.html', 'index.html');
updateHtmlFile('./admin.html', 'admin.html');

// Atualizar arquivo de configuração de deploy
try {
  const deployConfig = {
    buildDate: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production',
    platform: 'vercel',
    apiUrl: API_URL,
    frontendUrl: FRONTEND_URL,
    configuredAt: new Date().toISOString()
  };
  
  fs.writeFileSync('./deploy-config.json', JSON.stringify(deployConfig, null, 2));
  console.log('✅ deploy-config.json atualizado');
} catch (error) {
  console.error('❌ Erro ao atualizar deploy-config.json:', error.message);
}

console.log('');
console.log('🚀 URLs configuradas com sucesso!');
console.log('📝 Agora você pode fazer o deploy na Vercel.');
console.log('');
console.log('💡 Dica: Para reverter para placeholders, execute:');
console.log('   npm run build:vercel');