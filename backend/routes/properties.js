const express = require('express');
const propertyController = require('../controllers/propertyController');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas

// GET /api/properties - Buscar propriedades com filtros
router.get('/', 
  validate(schemas.propertySearch),
  propertyController.searchProperties
);

// GET /api/properties/featured - Buscar propriedades em destaque
router.get('/featured', propertyController.getFeaturedProperties);

// GET /api/properties/:id - Buscar propriedade por ID
router.get('/:id', propertyController.getPropertyById);

// GET /api/properties/:id/similar - Buscar propriedades similares
router.get('/:id/similar', propertyController.getSimilarProperties);

// Rotas administrativas (requerem autenticação)
// Nota: Adicionar middleware de autenticação quando implementado

// POST /api/properties - Criar nova propriedade
router.post('/', 
  // authMiddleware, // Descomentar quando autenticação estiver implementada
  propertyController.createProperty
);

// PUT /api/properties/:id - Atualizar propriedade
router.put('/:id', 
  // authMiddleware,
  propertyController.updateProperty
);

// DELETE /api/properties/:id - Deletar propriedade (soft delete)
router.delete('/:id', 
  // authMiddleware,
  propertyController.deleteProperty
);

// GET /api/properties/admin/stats - Obter estatísticas de propriedades
router.get('/admin/stats', 
  // authMiddleware,
  propertyController.getStats
);

module.exports = router;