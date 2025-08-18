const Property = require('../models/Property');
const { catchAsync } = require('../utils/catchAsync');

// Buscar propriedades com filtros
const searchProperties = catchAsync(async (req, res) => {
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

  const result = await Property.search(filters);

  res.status(200).json({
    success: true,
    message: 'Propriedades encontradas com sucesso',
    data: result
  });
});

// Buscar propriedade por ID
const getPropertyById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const property = await Property.findById(id);
  
  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Propriedade não encontrada'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Propriedade encontrada com sucesso',
    data: property
  });
});

// Buscar propriedades em destaque
const getFeaturedProperties = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;
  
  const properties = await Property.getFeatured(limit);

  res.status(200).json({
    success: true,
    message: 'Propriedades em destaque encontradas com sucesso',
    data: properties
  });
});

// Buscar propriedades similares
const getSimilarProperties = catchAsync(async (req, res) => {
  const { id } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : 4;
  
  // Primeiro busca a propriedade para obter tipo e cidade
  const property = await Property.findById(id);
  
  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Propriedade não encontrada'
    });
  }

  const similarProperties = await Property.getSimilar(
    id, 
    property.type, 
    property.city, 
    limit
  );

  res.status(200).json({
    success: true,
    message: 'Propriedades similares encontradas com sucesso',
    data: similarProperties
  });
});

// Criar nova propriedade (admin)
const createProperty = catchAsync(async (req, res) => {
  const propertyData = req.body;
  
  const property = await Property.create(propertyData);

  res.status(201).json({
    success: true,
    message: 'Propriedade criada com sucesso',
    data: property
  });
});

// Atualizar propriedade (admin)
const updateProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const propertyData = req.body;
  
  const property = await Property.update(id, propertyData);

  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Propriedade não encontrada'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Propriedade atualizada com sucesso',
    data: property
  });
});

// Deletar propriedade (admin)
const deleteProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const property = await Property.delete(id);

  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Propriedade não encontrada'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Propriedade deletada com sucesso',
    data: property
  });
});

// Obter estatísticas
const getStats = catchAsync(async (req, res) => {
  const stats = await Property.getStats();

  res.status(200).json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
});

module.exports = {
  searchProperties,
  getPropertyById,
  getFeaturedProperties,
  getSimilarProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getStats
};