const Chat = require('../models/Chat');
const { catchAsync } = require('../utils/catchAsync');

// Iniciar nova sessão de chat
const startSession = catchAsync(async (req, res) => {
  const { userInfo } = req.body;
  
  const session = await Chat.createSession(userInfo);

  // Criar mensagem de boas-vindas automática
  const welcomeMessage = 'Olá! Bem-vindo ao atendimento da Morada Premium! Sou o assistente virtual do Valmike Junior. Como posso ajudá-lo hoje? 😊';
  
  await Chat.createMessage(session.id, welcomeMessage, 'bot', {
    type: 'welcome',
    automated: true
  });

  res.status(201).json({
    success: true,
    message: 'Sessão de chat iniciada com sucesso',
    data: {
      sessionId: session.id,
      status: session.status,
      created_at: session.created_at
    }
  });
});

// Enviar mensagem
const sendMessage = catchAsync(async (req, res) => {
  const { sessionId, message, userInfo } = req.body;
  
  // Verificar se a sessão existe
  const session = await Chat.findSessionById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de chat não encontrada'
    });
  }

  if (session.status === 'closed') {
    return res.status(400).json({
      success: false,
      error: 'Sessão de chat está fechada'
    });
  }

  // Atualizar informações do usuário se fornecidas
  if (userInfo && Object.keys(userInfo).length > 0) {
    await Chat.updateSession(sessionId, userInfo);
  }

  // Criar mensagem do usuário
  const userMessage = await Chat.createMessage(sessionId, message, 'user', {
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  // Gerar resposta automática
  const autoResponse = Chat.generateAutoResponse(message);
  
  // Criar mensagem de resposta automática
  const botMessage = await Chat.createMessage(sessionId, autoResponse, 'bot', {
    type: 'auto_response',
    automated: true,
    response_to: userMessage.id
  });

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada com sucesso',
    data: {
      userMessage,
      botMessage
    }
  });
});

// Buscar mensagens da sessão
const getSessionMessages = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  
  const session = await Chat.findSessionById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de chat não encontrada'
    });
  }

  const messages = await Chat.getSessionMessages(sessionId, limit);

  res.status(200).json({
    success: true,
    message: 'Mensagens encontradas com sucesso',
    data: {
      session: {
        id: session.id,
        status: session.status,
        user_name: session.user_name,
        user_email: session.user_email,
        user_phone: session.user_phone,
        created_at: session.created_at,
        last_activity: session.last_activity
      },
      messages
    }
  });
});

// Buscar sessão completa com mensagens
const getSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  
  const sessionWithMessages = await Chat.getSessionWithMessages(sessionId);
  
  if (!sessionWithMessages.id) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de chat não encontrada'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Sessão encontrada com sucesso',
    data: sessionWithMessages
  });
});

// Fechar sessão
const closeSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body;
  
  const session = await Chat.closeSession(sessionId, reason || 'user_ended');
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de chat não encontrada'
    });
  }

  // Criar mensagem de encerramento
  const closingMessage = 'Obrigado por entrar em contato conosco! Se precisar de mais alguma coisa, estaremos sempre aqui para ajudar. Tenha um ótimo dia! 👋';
  
  await Chat.createMessage(sessionId, closingMessage, 'bot', {
    type: 'closing',
    automated: true
  });

  res.status(200).json({
    success: true,
    message: 'Sessão encerrada com sucesso',
    data: session
  });
});

// Buscar sessões ativas (admin)
const getActiveSessions = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  
  const sessions = await Chat.getActiveSessions(limit);

  res.status(200).json({
    success: true,
    message: 'Sessões ativas encontradas com sucesso',
    data: sessions
  });
});

// Buscar todas as sessões (admin)
const getAllSessions = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 20
  };

  // Remove filtros undefined
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  const result = await Chat.getAllSessions(filters);

  res.status(200).json({
    success: true,
    message: 'Sessões encontradas com sucesso',
    data: result
  });
});

// Enviar mensagem manual (admin)
const sendManualMessage = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Mensagem é obrigatória'
    });
  }

  const session = await Chat.findSessionById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de chat não encontrada'
    });
  }

  const adminMessage = await Chat.createMessage(sessionId, message, 'admin', {
    type: 'manual_response',
    automated: false,
    admin_id: req.user?.id || 'admin' // Se houver autenticação
  });

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada com sucesso',
    data: adminMessage
  });
});

// Transferir para atendimento humano
const transferToHuman = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body;
  
  const session = await Chat.findSessionById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de chat não encontrada'
    });
  }

  // Atualizar status da sessão
  await Chat.updateSession(sessionId, { status: 'human_transfer' });

  // Criar mensagem de transferência
  const transferMessage = 'Vou transferir você para o Valmike Junior para um atendimento mais personalizado. Ele entrará em contato em breve! 👨‍💼';
  
  const botMessage = await Chat.createMessage(sessionId, transferMessage, 'bot', {
    type: 'transfer',
    automated: true,
    transfer_reason: reason
  });

  res.status(200).json({
    success: true,
    message: 'Sessão transferida para atendimento humano',
    data: {
      session,
      transferMessage: botMessage
    }
  });
});

// Obter estatísticas do chat (admin)
const getStats = catchAsync(async (req, res) => {
  const stats = await Chat.getStats();

  res.status(200).json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
});

module.exports = {
  startSession,
  sendMessage,
  getSessionMessages,
  getSession,
  closeSession,
  getActiveSessions,
  getAllSessions,
  sendManualMessage,
  transferToHuman,
  getStats
};