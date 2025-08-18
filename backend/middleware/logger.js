const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log da requisição
  console.log(`📥 [${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Interceptar a resposta para logar o tempo de processamento
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    
    console.log(`📤 [${new Date().toISOString()}] ${statusColor} ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`);
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = logger;