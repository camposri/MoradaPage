const { setCorsHeaders, rateLimit, checkMethod, catchAsync } = require('../_lib/middleware');
const { searchProperties } = require('../_lib/supabase');

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET'])) return;
  
  // Aplicar rate limiting
  const rateLimiter = rateLimit();
  if (!rateLimiter(req, res)) return;

  // Validar parâmetros de query
  const filters = {
    type: req.query.type,
    city: req.query.city,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
    bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined,
    area: req.query.area ? parseFloat(req.query.area) : undefined,
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 10
  };

  // Remove filtros undefined
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  const result = await searchProperties(filters);

  res.status(200).json({
    success: true,
    message: 'Propriedades encontradas com sucesso',
    data: result
  });
});