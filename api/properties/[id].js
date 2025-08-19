const { setCorsHeaders, rateLimit, checkMethod, catchAsync } = require('../_lib/middleware');
const { getPropertyById, getSimilarProperties } = require('../_lib/supabase');

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET'])) return;
  
  // Aplicar rate limiting
  const rateLimiter = rateLimit();
  if (!rateLimiter(req, res)) return;

  const { id } = req.query;
  const { similar } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'ID da propriedade é obrigatório'
    });
  }

  if (similar === 'true') {
    // Buscar propriedades similares
    const similarProperties = await getSimilarProperties(id);
    
    return res.status(200).json({
      success: true,
      message: 'Propriedades similares encontradas com sucesso',
      data: similarProperties
    });
  } else {
    // Buscar propriedade específica
    const property = await getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propriedade não encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Propriedade encontrada com sucesso',
      data: property
    });
  }
});