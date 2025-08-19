// Vercel Serverless Function - API Root
const { setCorsHeaders, checkMethod, catchAsync } = require('./_lib/middleware');

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET'])) return;

  res.status(200).json({
    success: true,
    message: 'Morada Premium API - Serverless Functions',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      properties: {
        search: '/api/properties/search',
        featured: '/api/properties/featured',
        byId: '/api/properties/[id]'
      },
      contact: '/api/contact',
      visits: '/api/visits',
      chat: '/api/chat'
    },
    timestamp: new Date().toISOString()
  });
});