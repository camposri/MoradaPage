const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando build para Vercel...');

// URLs de produção (serão definidas automaticamente pela Vercel)
// Durante o build na Vercel, VERCEL_URL será definido automaticamente
// Para desenvolvimento local, use uma URL específica ou deixe como placeholder
const VERCEL_URL = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'YOUR_VERCEL_APP_URL';
const API_URL = `https://${VERCEL_URL}/api`;

// Se não há URL definida, usar placeholder que será substituído no deploy
const FINAL_API_URL = VERCEL_URL === 'YOUR_VERCEL_APP_URL' ? 'https://YOUR_VERCEL_APP_URL/api' : API_URL;
const FINAL_FRONTEND_URL = VERCEL_URL === 'YOUR_VERCEL_APP_URL' ? 'https://YOUR_VERCEL_APP_URL' : `https://${VERCEL_URL}`;

// Função para atualizar URLs nos arquivos HTML
function updateHtmlFile(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituir URLs do localhost para produção
    content = content.replace(/http:\/\/localhost:3000\/api/g, FINAL_API_URL);
    content = content.replace(/http:\/\/localhost:8000/g, FINAL_FRONTEND_URL);
    
    // Substituir URLs hardcoded do Vercel (caso existam)
    content = content.replace(/https:\/\/sua-app\.vercel\.app\/api/g, FINAL_API_URL);
    content = content.replace(/https:\/\/sua-app\.vercel\.app/g, FINAL_FRONTEND_URL);
    
    // Substituir placeholder URLs
    content = content.replace(/https:\/\/YOUR_VERCEL_APP_URL\/api/g, FINAL_API_URL);
    content = content.replace(/https:\/\/YOUR_VERCEL_APP_URL/g, FINAL_FRONTEND_URL);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${fileName} atualizado com URLs de produção`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${fileName}:`, error.message);
  }
}

// Atualizar arquivos HTML
updateHtmlFile('./index.html', 'index.html');
updateHtmlFile('./admin.html', 'admin.html');

// Criar arquivo de configuração de deploy
const deployConfig = {
  buildDate: new Date().toISOString(),
  version: '1.0.0',
  environment: 'production',
  platform: 'vercel',
  apiUrl: FINAL_API_URL,
  frontendUrl: FINAL_FRONTEND_URL
};

fs.writeFileSync('./deploy-config.json', JSON.stringify(deployConfig, null, 2));

console.log('✅ Build para Vercel concluído!');
console.log('📋 Configurações:');
console.log(`   - API URL: ${FINAL_API_URL}`);
console.log(`   - Frontend URL: ${FINAL_FRONTEND_URL}`);
console.log('');
console.log('🚀 Pronto para deploy na Vercel!');
console.log('');
console.log('📝 Próximos passos:');
console.log('1. Faça commit das alterações');
console.log('2. Conecte o repositório à Vercel');
console.log('3. Configure as variáveis de ambiente no painel da Vercel');
console.log('4. Faça o deploy!');