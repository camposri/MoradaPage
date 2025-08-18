const express = require('express');
const contactController = require('../controllers/contactController');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas

// POST /api/contact - Criar novo contato
router.post('/', 
  validate(schemas.contact),
  contactController.createContact
);

// Rotas administrativas (requerem autenticação)
// Nota: Adicionar middleware de autenticação quando implementado

// GET /api/contact - Buscar todos os contatos
router.get('/', 
  // authMiddleware, // Descomentar quando autenticação estiver implementada
  contactController.getAllContacts
);

// GET /api/contact/:id - Buscar contato por ID
router.get('/:id', 
  // authMiddleware,
  contactController.getContactById
);

// PUT /api/contact/:id/status - Atualizar status do contato
router.put('/:id/status', 
  // authMiddleware,
  contactController.updateContactStatus
);

// PUT /api/contact/:id/read - Marcar contato como lido
router.put('/:id/read', 
  // authMiddleware,
  contactController.markAsRead
);

// POST /api/contact/:id/reply - Responder a um contato
router.post('/:id/reply', 
  // authMiddleware,
  contactController.respondContact
);

// DELETE /api/contact/:id - Deletar contato
router.delete('/:id', 
  // authMiddleware,
  contactController.deleteContact
);

// GET /api/contact/admin/stats - Obter estatísticas de contatos
router.get('/admin/stats', 
  // authMiddleware,
  contactController.getStats
);

module.exports = router;