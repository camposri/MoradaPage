// const supabase = require('../config/supabase');
// Mock data para desenvolvimento local
const mockChatSessions = [];
const mockChatMessages = [];
let nextSessionId = 1;
let nextMessageId = 1;

class Chat {
  constructor() {
    this.sessionsTable = 'chat_sessions';
    this.messagesTable = 'chat_messages';
  }

  // Criar nova sessão de chat
  async createSession(userInfo = {}) {
    try {
      // Mock implementation para desenvolvimento local
      const newSession = {
        id: nextSessionId++,
        user_name: userInfo.name || null,
        user_email: userInfo.email || null,
        user_phone: userInfo.phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockChatSessions.push(newSession);
      return newSession;
    } catch (error) {
      throw error;
    }
  }

  // Buscar sessão por ID
  async findSessionById(sessionId) {
    try {
      // Mock implementation para desenvolvimento local
      const session = mockChatSessions.find(s => s.id == sessionId);
      if (!session) {
        throw new Error('Sessão de chat não encontrada');
      }
      return session;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar informações da sessão
  async updateSession(sessionId, userInfo) {
    try {
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .update({
          user_name: userInfo.name || null,
          user_email: userInfo.email || null,
          user_phone: userInfo.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Criar nova mensagem
  async createMessage(sessionId, message, sender = 'user', metadata = {}) {
    try {
      // Mock implementation para desenvolvimento local
      const newMessage = {
        id: nextMessageId++,
        session_id: sessionId,
        message,
        sender,
        metadata,
        created_at: new Date().toISOString()
      };
      
      mockChatMessages.push(newMessage);

      // Atualizar última atividade da sessão
      await this.updateSessionActivity(sessionId);

      return newMessage;
    } catch (error) {
      throw error;
    }
  }

  // Buscar mensagens de uma sessão
  async getSessionMessages(sessionId, limit = 50) {
    try {
      // Mock implementation para desenvolvimento local
      const messages = mockChatMessages
        .filter(m => m.session_id == sessionId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(0, limit);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  // Buscar sessão com mensagens
  async getSessionWithMessages(sessionId) {
    try {
      const session = await this.findSessionById(sessionId);
      const messages = await this.getSessionMessages(sessionId);

      return {
        ...session,
        messages
      };
    } catch (error) {
      throw error;
    }
  }

  // Atualizar última atividade da sessão
  async updateSessionActivity(sessionId) {
    try {
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .update({
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Fechar sessão
  async closeSession(sessionId, reason = 'user_ended') {
    try {
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .update({
          status: 'closed',
          end_reason: reason,
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar sessões ativas (para admin)
  async getActiveSessions(limit = 20) {
    try {
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .select(`
          *,
          chat_messages!inner(
            message,
            created_at
          )
        `)
        .eq('status', 'active')
        .order('last_activity', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar todas as sessões (para admin)
  async getAllSessions(filters = {}) {
    try {
      let query = supabase
        .from(this.sessionsTable)
        .select('*');

      // Filtrar por status
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Filtrar por data
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Ordenação
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        sessions: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Gerar resposta automática baseada na mensagem
  generateAutoResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
      return 'Olá! Sou o assistente virtual do Valmike Junior. Como posso ajudá-lo hoje? Posso fornecer informações sobre nossos imóveis, agendar visitas ou responder suas dúvidas.';
    }
    
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custo')) {
      return 'Para informações sobre preços e valores dos nossos imóveis, posso conectá-lo diretamente com o Valmike Junior. Você gostaria de agendar uma conversa ou tem algum imóvel específico em mente?';
    }
    
    if (lowerMessage.includes('visita') || lowerMessage.includes('agendar') || lowerMessage.includes('ver')) {
      return 'Ótimo! Posso ajudá-lo a agendar uma visita. Para isso, preciso de algumas informações: seu nome, telefone, e-mail e qual imóvel você gostaria de visitar. Você pode me fornecer esses dados?';
    }
    
    if (lowerMessage.includes('casa') || lowerMessage.includes('apartamento') || lowerMessage.includes('terreno')) {
      return 'Temos uma excelente seleção de imóveis! Você está procurando algo específico? Posso ajudá-lo com informações sobre localização, tamanho, preço ou outras características que sejam importantes para você.';
    }
    
    if (lowerMessage.includes('itaguajé') || lowerMessage.includes('região')) {
      return 'O Valmike Junior é especialista em imóveis em Itaguajé e região! Conhece muito bem o mercado local e pode oferecer as melhores oportunidades. Que tipo de imóvel você está procurando na região?';
    }
    
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('whatsapp')) {
      return 'Você pode entrar em contato com o Valmike Junior pelos seguintes canais:\n\n📱 Telefone/WhatsApp: (44) 99164-5526\n📧 E-mail: valmikejunior@creci.org.br\n\nOu se preferir, posso ajudá-lo aqui mesmo! O que você gostaria de saber?';
    }
    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada') || lowerMessage.includes('valeu')) {
      return 'Por nada! Fico feliz em ajudar. Se precisar de mais alguma coisa ou quiser falar diretamente com o Valmike Junior, estarei aqui. Tenha um ótimo dia! 😊';
    }
    
    if (lowerMessage.includes('tchau') || lowerMessage.includes('até logo') || lowerMessage.includes('bye')) {
      return 'Até logo! Foi um prazer ajudá-lo. Lembre-se que estou sempre aqui para esclarecer dúvidas sobre imóveis. Volte sempre! 👋';
    }
    
    // Resposta padrão
    return 'Entendi sua mensagem! Para melhor atendê-lo, posso conectá-lo diretamente com o Valmike Junior, que é especialista em imóveis em Itaguajé e região. Você gostaria de:\n\n1. Agendar uma visita\n2. Receber informações sobre imóveis\n3. Falar diretamente com o corretor\n\nOu me conte mais sobre o que está procurando!';
  }

  // Obter estatísticas do chat
  async getStats() {
    try {
      const { count: totalSessions } = await supabase
        .from(this.sessionsTable)
        .select('*', { count: 'exact', head: true });

      const { count: activeSessions } = await supabase
        .from(this.sessionsTable)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalMessages } = await supabase
        .from(this.messagesTable)
        .select('*', { count: 'exact', head: true });

      // Sessões dos últimos 7 dias
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: recentSessions } = await supabase
        .from(this.sessionsTable)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      return {
        totalSessions,
        activeSessions,
        totalMessages,
        recentSessions
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Chat();