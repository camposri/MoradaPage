const express = require('express');
const chatController = require('../controllers/chatController');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas

// POST /api/chat/session - Iniciar nova sessão de chat
router.post('/session', chatController.startSession);

// POST /api/chat/message - Enviar mensagem
router.post('/message', 
  validate(schemas.chatMessage),
  chatController.sendMessage
);

// GET /api/chat/session/:sessionId - Buscar sessão com mensagens
router.get('/session/:sessionId', chatController.getSession);

// GET /api/chat/session/:sessionId/messages - Buscar mensagens da sessão
router.get('/session/:sessionId/messages', chatController.getSessionMessages);

// PUT /api/chat/session/:sessionId/close - Fechar sessão
router.put('/session/:sessionId/close', chatController.closeSession);

// PUT /api/chat/session/:sessionId/transfer - Transferir para atendimento humano
router.put('/session/:sessionId/transfer', chatController.transferToHuman);

// Rotas administrativas (requerem autenticação)
// Nota: Adicionar middleware de autenticação quando implementado

// GET /api/chat/admin/sessions/active - Buscar sessões ativas
router.get('/admin/sessions/active', 
  // authMiddleware, // Descomentar quando autenticação estiver implementada
  chatController.getActiveSessions
);

// GET /api/chat/admin/sessions - Buscar todas as sessões
router.get('/admin/sessions', 
  // authMiddleware,
  chatController.getAllSessions
);

// POST /api/chat/admin/session/:sessionId/message - Enviar mensagem manual (admin)
router.post('/admin/session/:sessionId/message', 
  // authMiddleware,
  chatController.sendManualMessage
);

// GET /api/chat/admin/stats - Obter estatísticas do chat
router.get('/admin/stats', 
  // authMiddleware,
  chatController.getStats
);

module.exports = router;