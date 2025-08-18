const Joi = require('joi');

// Middleware de validação genérico
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: error.details.map(detail => detail.message).join(', '),
        details: error.details
      });
    }
    
    next();
  };
};

// Schemas de validação
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
    message: Joi.string().required().min(10).max(1000).messages({
      'string.empty': 'Mensagem é obrigatória',
      'string.min': 'Mensagem deve ter pelo menos 10 caracteres',
      'string.max': 'Mensagem deve ter no máximo 1000 caracteres'
    }),
    subject: Joi.string().max(200).default('Contato via site')
  }),

  // Validação para agendamento de visita
  visit: Joi.object({
    propertyId: Joi.string().uuid().required().messages({
      'string.empty': 'ID do imóvel é obrigatório',
      'string.guid': 'ID do imóvel deve ser um UUID válido'
    }),
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'E-mail é obrigatório',
      'string.email': 'E-mail deve ter um formato válido'
    }),
    phone: Joi.string().required().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).messages({
      'string.empty': 'Telefone é obrigatório',
      'string.pattern.base': 'Telefone deve ter um formato válido'
    }),
    preferredDate: Joi.date().min('now').required().messages({
      'date.base': 'Data preferida deve ser uma data válida',
      'date.min': 'Data preferida deve ser futura',
      'any.required': 'Data preferida é obrigatória'
    }),
    preferredTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.empty': 'Horário preferido é obrigatório',
      'string.pattern.base': 'Horário deve estar no formato HH:MM'
    }),
    message: Joi.string().max(500)
  }),

  // Validação para mensagem do chat
  chatMessage: Joi.object({
    message: Joi.string().required().min(1).max(1000).messages({
      'string.empty': 'Mensagem é obrigatória',
      'string.max': 'Mensagem deve ter no máximo 1000 caracteres'
    }),
    sessionId: Joi.string().uuid().optional(),
    userInfo: Joi.object({
      name: Joi.string().max(100),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)
    }).optional()
  })
};

module.exports = {
  validate,
  schemas
};