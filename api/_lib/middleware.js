const Joi = require('joi');

// Rate limiting simples usando Map em memória (para Vercel Functions)
const rateLimitMap = new Map();

// Middleware de CORS
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Middleware de rate limiting
function rateLimit(windowMs = 15 * 60 * 1000, maxRequests = 100) {
  return (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpar entradas antigas
    for (const [ip, requests] of rateLimitMap.entries()) {
      const filteredRequests = requests.filter(timestamp => timestamp > windowStart);
      if (filteredRequests.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, filteredRequests);
      }
    }
    
    // Verificar limite para o IP atual
    const clientRequests = rateLimitMap.get(clientIp) || [];
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições',
        message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Adicionar requisição atual
    recentRequests.push(now);
    rateLimitMap.set(clientIp, recentRequests);
    
    if (next) next();
    return true;
  };
}

// Middleware de validação
function validate(schema) {
  return (data) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        error: {
          success: false,
          error: 'Dados inválidos',
          message: error.details.map(detail => detail.message).join(', '),
          details: error.details
        }
      };
    }
    
    return {
      isValid: true,
      value
    };
  };
}

// Schemas de validação reutilizáveis
const schemas = {
  // Validação para busca de imóveis
  propertySearch: Joi.object({
    type: Joi.string().valid('casa', 'apartamento', 'terreno', 'loteamento', 'propriedade-rural', 'sitio-fazenda'),
    city: Joi.string().min(2).max(100),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    bedrooms: Joi.number().integer().min(0).max(10),
    bathrooms: Joi.number().integer().min(0).max(10),
    area: Joi.number().min(0),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  // Validação para formulário de contato
  contact: Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'E-mail é obrigatório',
      'string.email': 'E-mail deve ter um formato válido'
    }),
    phone: Joi.string().required().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).messages({
      'string.empty': 'Telefone é obrigatório',
      'string.pattern.base': 'Telefone deve ter um formato válido (ex: (44) 99999-9999)'
    }),
    subject: Joi.string().required().min(5).max(200).messages({
      'string.empty': 'Assunto é obrigatório',
      'string.min': 'Assunto deve ter pelo menos 5 caracteres',
      'string.max': 'Assunto deve ter no máximo 200 caracteres'
    }),
    message: Joi.string().required().min(10).max(1000).messages({
      'string.empty': 'Mensagem é obrigatória',
      'string.min': 'Mensagem deve ter pelo menos 10 caracteres',
      'string.max': 'Mensagem deve ter no máximo 1000 caracteres'
    }),
    propertyId: Joi.string().uuid().optional(),
    source: Joi.string().valid('website', 'whatsapp', 'phone', 'email').default('website')
  }),

  // Validação para agendamento de visita
  visit: Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'E-mail é obrigatório',
      'string.email': 'E-mail deve ter um formato válido'
    }),
    phone: Joi.string().required().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).messages({
      'string.empty': 'Telefone é obrigatório',
      'string.pattern.base': 'Telefone deve ter um formato válido (ex: (44) 99999-9999)'
    }),
    propertyId: Joi.string().uuid().required().messages({
      'string.empty': 'ID da propriedade é obrigatório',
      'string.guid': 'ID da propriedade deve ser um UUID válido'
    }),
    visitDate: Joi.date().iso().greater('now').required().messages({
      'date.base': 'Data da visita deve ser uma data válida',
      'date.greater': 'Data da visita deve ser no futuro',
      'any.required': 'Data da visita é obrigatória'
    }),
    visitTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.empty': 'Horário da visita é obrigatório',
      'string.pattern.base': 'Horário deve estar no formato HH:MM'
    }),
    message: Joi.string().max(500).optional()
  }),

  // Validação para mensagem de chat
  chatMessage: Joi.object({
    sessionId: Joi.string().uuid().required().messages({
      'string.empty': 'ID da sessão é obrigatório',
      'string.guid': 'ID da sessão deve ser um UUID válido'
    }),
    message: Joi.string().required().min(1).max(1000).messages({
      'string.empty': 'Mensagem é obrigatória',
      'string.min': 'Mensagem não pode estar vazia',
      'string.max': 'Mensagem deve ter no máximo 1000 caracteres'
    }),
    userInfo: Joi.object({
      name: Joi.string().max(100),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)
    }).optional()
  })
};

// Função para lidar com erros de forma consistente
function handleError(error, res) {
  console.error('Erro:', error);
  
  // Erro de validação do Joi
  if (error.isJoi) {
    const message = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      message,
      details: error.details
    });
  }

  // Erro do Supabase
  if (error.code) {
    let message = 'Erro interno do servidor';
    let statusCode = 500;

    switch (error.code) {
      case '23505': // Unique violation
        message = 'Registro já existe';
        statusCode = 409;
        break;
      case '23503': // Foreign key violation
        message = 'Referência inválida';
        statusCode = 400;
        break;
      case 'PGRST116': // Not found
        message = 'Registro não encontrado';
        statusCode = 404;
        break;
      default:
        message = error.message || 'Erro interno do servidor';
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
      code: error.code
    });
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: error.message
  });
}

// Função wrapper para capturar erros async
function catchAsync(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      handleError(error, res);
    }
  };
}

// Função para verificar método HTTP
function checkMethod(req, res, allowedMethods) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }

  if (!allowedMethods.includes(req.method)) {
    res.status(405).json({
      success: false,
      error: 'Método não permitido',
      allowedMethods
    });
    return false;
  }

  return true;
}

module.exports = {
  setCorsHeaders,
  rateLimit,
  validate,
  schemas,
  handleError,
  catchAsync,
  checkMethod
};