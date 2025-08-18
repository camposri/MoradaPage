const fs = require('fs');
const path = require('path');

// Configurações de produção
const BACKEND_URL = process.env.BACKEND_URL || 'https://sua-api.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://seu-site.vercel.app';

console.log('🔧 Iniciando build para produção...');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}`);

// Função para substituir URLs nos arquivos
function replaceUrls(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(({ from, to }) => {
      const regex = new RegExp(from, 'g');
      content = content.replace(regex, to);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Atualizado: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Arquivos para atualizar
const files = [
  {
    path: './index.html',
    replacements: [
      { from: 'http://localhost:3000', to: BACKEND_URL }
    ]
  },
  {
    path: './admin.html',
    replacements: [
      { from: 'http://localhost:3000', to: BACKEND_URL }
    ]
  }
];

// Processar arquivos
files.forEach(file => {
  if (fs.existsSync(file.path)) {
    replaceUrls(file.path, file.replacements);
  } else {
    console.warn(`⚠️ Arquivo não encontrado: ${file.path}`);
  }
});

// Criar arquivo de configuração para deploy
const deployConfig = {
  backend_url: BACKEND_URL,
  frontend_url: FRONTEND_URL,
  build_date: new Date().toISOString(),
  version: '1.0.0'
};

fs.writeFileSync('./deploy-config.json', JSON.stringify(deployConfig, null, 2));
console.log('✅ Configuração de deploy criada: deploy-config.json');

console.log('🎉 Build concluído com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Faça upload dos arquivos para seu provedor de hospedagem');
console.log('2. Configure as variáveis de ambiente no backend');
console.log('3. Teste todas as funcionalidades');
console.log('\n🔗 Links úteis:');
console.log(`- Frontend: ${FRONTEND_URL}`);
console.log(`- Backend: ${BACKEND_URL}`);
console.log(`- Admin: ${FRONTEND_URL}/admin.html`);