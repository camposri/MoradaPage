const express = require('express');
const visitController = require('../controllers/visitController');
const { validateRequest, visitSchema } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas

// POST /api/visits - Agendar nova visita
router.post('/', 
  validateRequest(visitSchema),
  visitController.scheduleVisit
);

// GET /api/visits/availability - Verificar disponibilidade de horário
router.get('/availability', visitController.checkAvailability);

// GET /api/visits/email/:email - Buscar visitas por email
router.get('/email/:email', visitController.getVisitsByEmail);

// PUT /api/visits/:id/confirm - Confirmar visita (via link no email)
router.put('/:id/confirm', visitController.confirmVisit);

// PUT /api/visits/:id/cancel - Cancelar visita
router.put('/:id/cancel', visitController.cancelVisit);

// Rotas administrativas (requerem autenticação)
// Nota: Adicionar middleware de autenticação quando implementado

// GET /api/visits - Buscar todas as visitas
router.get('/', 
  // authMiddleware, // Descomentar quando autenticação estiver implementada
  visitController.getAllVisits
);

// GET /api/visits/today - Buscar visitas do dia
router.get('/today', 
  // authMiddleware,
  visitController.getTodayVisits
);

// GET /api/visits/:id - Buscar visita por ID
router.get('/:id', 
  // authMiddleware,
  visitController.getVisitById
);

// PUT /api/visits/:id/status - Atualizar status da visita
router.put('/:id/status', 
  // authMiddleware,
  visitController.updateVisitStatus
);

// PUT /api/visits/:id/reschedule - Reagendar visita
router.put('/:id/reschedule', 
  // authMiddleware,
  visitController.rescheduleVisit
);

// DELETE /api/visits/:id - Deletar visita
router.delete('/:id', 
  // authMiddleware,
  visitController.deleteVisit
);

// GET /api/visits/admin/stats - Obter estatísticas de visitas
router.get('/admin/stats', 
  // authMiddleware,
  visitController.getStats
);

module.exports = router;