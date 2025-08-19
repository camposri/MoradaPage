const { setCorsHeaders, rateLimit, checkMethod, catchAsync } = require('../_lib/middleware');
const { getFeaturedProperties } = require('../_lib/supabase');

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET'])) return;
  
  // Aplicar rate limiting
  const rateLimiter = rateLimit();
  if (!rateLimiter(req, res)) return;

  const limit = req.query.limit ? parseInt(req.query.limit) : 6;
  const properties = await getFeaturedProperties(limit);

  res.status(200).json({
    success: true,
    message: 'Propriedades em destaque encontradas com sucesso',
    data: properties
  });
});