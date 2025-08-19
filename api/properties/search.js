const { searchProperties } = require('../_lib/supabase');

module.exports = async (req, res) => {
  console.log('=== PROPERTIES SEARCH DEBUG ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }
  
  try {
    // Extrair parâmetros de query
    const {
      type,
      min_price,
      max_price,
      min_area,
      max_area,
      bedrooms,
      bathrooms,
      location,
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtros
    const filters = {};
    if (type) filters.property_type = type;
    if (min_price) filters.min_price = parseFloat(min_price);
    if (max_price) filters.max_price = parseFloat(max_price);
    if (min_area) filters.min_area = parseFloat(min_area);
    if (max_area) filters.max_area = parseFloat(max_area);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);
    if (location) filters.location = location;

    console.log('Filters:', filters);

    // Buscar propriedades
    const result = await searchProperties(filters, parseInt(page), parseInt(limit));
    
    console.log('Search result:', result);
    
    return res.status(200).json({
      success: true,
      message: 'Propriedades encontradas com sucesso',
      data: result
    });
    
  } catch (error) {
    console.error('Error in search function:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};