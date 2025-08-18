const app = require('./src/app');
const emailService = require('./services/emailService');

// Configuração da porta
const PORT = process.env.PORT || 3000;

// Função para inicializar serviços
const initializeServices = async () => {
  try {
    // Inicializar serviço de email
    await emailService.initialize();
    
    console.log('✅ Todos os serviços foram inicializados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error.message);
    // Não interromper a aplicação por falha nos serviços
  }
};

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Inicializar serviços
    await initializeServices();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/health`);
      console.log(`📋 API Base: http://localhost:${PORT}/api`);
    });

    // Tratamento de encerramento gracioso
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor...`);
      
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
      
      // Forçar encerramento após 10 segundos
      setTimeout(() => {
        console.error('❌ Forçando encerramento do servidor');
        process.exit(1);
      }, 10000);
    };

    // Escutar sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Tratamento de erros não capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Erro não capturado:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promise rejeitada não tratada:', reason);
      console.error('Promise:', promise);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar aplicação
if (require.main === module) {
  startServer();
}

module.exports = app;