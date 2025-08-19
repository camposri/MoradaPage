const { setCorsHeaders, rateLimit, checkMethod, validate, catchAsync } = require('../_lib/middleware');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Função para iniciar nova sessão de chat
async function startSession() {
  const sessionId = uuidv4();
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{
      id: sessionId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Enviar mensagem de boas-vindas
  const welcomeMessage = {
    session_id: sessionId,
    message: 'Olá! Bem-vindo à Morada Premium. Como posso ajudá-lo hoje?',
    sender: 'bot',
    message_type: 'text',
    created_at: new Date().toISOString()
  };

  await supabase
    .from('chat_messages')
    .insert([welcomeMessage]);

  return { ...data, welcomeMessage };
}

// Função para enviar mensagem
async function sendMessage(messageData) {
  const { sessionId, message, userInfo } = messageData;

  // Verificar se a sessão existe e está ativa
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('status', 'active')
    .single();

  if (sessionError || !session) {
    throw new Error('Sessão não encontrada ou inativa');
  }

  // Salvar mensagem do usuário
  const userMessage = {
    session_id: sessionId,
    message: message,
    sender: 'user',
    message_type: 'text',
    created_at: new Date().toISOString()
  };

  const { data: savedMessage, error: messageError } = await supabase
    .from('chat_messages')
    .insert([userMessage])
    .select()
    .single();

  if (messageError) {
    throw messageError;
  }

  // Atualizar informações do usuário na sessão se fornecidas
  if (userInfo) {
    await supabase
      .from('chat_sessions')
      .update({
        user_name: userInfo.name,
        user_email: userInfo.email,
        user_phone: userInfo.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }

  // Gerar resposta automática simples
  const botResponse = generateBotResponse(message);
  
  const botMessage = {
    session_id: sessionId,
    message: botResponse,
    sender: 'bot',
    message_type: 'text',
    created_at: new Date().toISOString()
  };

  const { data: botMessageData } = await supabase
    .from('chat_messages')
    .insert([botMessage])
    .select()
    .single();

  // Atualizar timestamp da sessão
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return {
    userMessage: savedMessage,
    botMessage: botMessageData
  };
}

// Função para gerar resposta automática do bot
function generateBotResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
    return 'Olá! Como posso ajudá-lo hoje? Posso fornecer informações sobre nossos imóveis, agendar visitas ou responder suas dúvidas.';
  }
  
  if (message.includes('imóvel') || message.includes('casa') || message.includes('apartamento') || message.includes('propriedade')) {
    return 'Temos uma grande variedade de imóveis disponíveis! Você pode navegar pelo nosso catálogo no site ou me dizer que tipo de imóvel você está procurando.';
  }
  
  if (message.includes('visita') || message.includes('agendar') || message.includes('ver')) {
    return 'Posso ajudá-lo a agendar uma visita! Você pode usar nosso formulário de agendamento no site ou me fornecer seus dados de contato.';
  }
  
  if (message.includes('preço') || message.includes('valor') || message.includes('custo')) {
    return 'Os preços variam conforme o tipo e localização do imóvel. Posso conectá-lo com um de nossos consultores para informações detalhadas sobre preços.';
  }
  
  if (message.includes('contato') || message.includes('telefone') || message.includes('email')) {
    return 'Você pode entrar em contato conosco através do formulário no site, ou posso transferir você para um atendente humano. Qual prefere?';
  }
  
  if (message.includes('obrigado') || message.includes('obrigada') || message.includes('valeu')) {
    return 'De nada! Fico feliz em ajudar. Se tiver mais alguma dúvida, estarei aqui!';
  }
  
  if (message.includes('tchau') || message.includes('até logo') || message.includes('adeus')) {
    return 'Até logo! Foi um prazer ajudá-lo. Volte sempre que precisar!';
  }
  
  // Resposta padrão
  return 'Entendo. Posso ajudá-lo com informações sobre imóveis, agendamento de visitas ou conectá-lo com um de nossos consultores. O que você gostaria de saber?';
}

// Função para buscar sessão com mensagens
async function getSession(sessionId) {
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    throw sessionError;
  }

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    throw messagesError;
  }

  return {
    session,
    messages
  };
}

// Função para buscar todas as sessões (admin)
async function getAllSessions(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil(count / limit);

  return {
    sessions: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET', 'POST'])) return;
  
  // Aplicar rate limiting
  const rateLimiter = rateLimit();
  if (!rateLimiter(req, res)) return;

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  if (req.method === 'POST') {
    if (pathname === '/api/chat/session') {
      // Iniciar nova sessão
      const session = await startSession();
      
      return res.status(201).json({
        success: true,
        message: 'Sessão de chat iniciada com sucesso',
        data: session
      });
    }
    
    if (pathname === '/api/chat/message') {
      // Validar dados da mensagem
      const validatedData = validate(req.body, 'chatMessage', res);
      if (!validatedData) return;

      const result = await sendMessage(validatedData);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: result
      });
    }
  }
  
  if (req.method === 'GET') {
    // Buscar sessão específica
    const sessionIdMatch = pathname.match(/\/api\/chat\/session\/([^/]+)$/);
    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];
      const sessionData = await getSession(sessionId);
      
      return res.status(200).json({
        success: true,
        message: 'Sessão encontrada com sucesso',
        data: sessionData
      });
    }
    
    // Buscar todas as sessões (admin)
    if (pathname === '/api/chat/admin/sessions') {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      const result = await getAllSessions(page, limit);
      
      return res.status(200).json({
        success: true,
        message: 'Sessões encontradas com sucesso',
        data: result
      });
    }
  }
  
  // Rota não encontrada
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});