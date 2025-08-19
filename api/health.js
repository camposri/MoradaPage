const { setCorsHeaders, checkMethod, catchAsync } = require('./_lib/middleware');

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET'])) return;

  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});