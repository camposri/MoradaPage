const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando build para Vercel...');

// URLs de produção (serão definidas automaticamente pela Vercel)
const VERCEL_URL = process.env.VERCEL_URL || 'sua-app.vercel.app';
const API_URL = `https://${VERCEL_URL}/api`;

// Função para atualizar URLs nos arquivos HTML
function updateHtmlFile(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituir URLs do localhost para produção
    content = content.replace(/http:\/\/localhost:3000\/api/g, API_URL);
    content = content.replace(/http:\/\/localhost:8000/g, `https://${VERCEL_URL}`);
    
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
  apiUrl: API_URL,
  frontendUrl: `https://${VERCEL_URL}`
};

fs.writeFileSync('./deploy-config.json', JSON.stringify(deployConfig, null, 2));

console.log('✅ Build para Vercel concluído!');
console.log('📋 Configurações:');
console.log(`   - API URL: ${API_URL}`);
console.log(`   - Frontend URL: https://${VERCEL_URL}`);
console.log('');
console.log('🚀 Pronto para deploy na Vercel!');
console.log('');
console.log('📝 Próximos passos:');
console.log('1. Faça commit das alterações');
console.log('2. Conecte o repositório à Vercel');
console.log('3. Configure as variáveis de ambiente no painel da Vercel');
console.log('4. Faça o deploy!');