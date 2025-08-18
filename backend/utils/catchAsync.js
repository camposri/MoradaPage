/**
 * Wrapper para funções assíncronas que captura erros automaticamente
 * e os passa para o middleware de tratamento de erros do Express
 * 
 * @param {Function} fn - Função assíncrona a ser executada
 * @returns {Function} - Função wrapper que captura erros
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Classe para erros personalizados da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Função para criar respostas de sucesso padronizadas
 * 
 * @param {Object} res - Objeto response do Express
 * @param {number} statusCode - Código de status HTTP
 * @param {string} message - Mensagem de sucesso
 * @param {*} data - Dados a serem retornados
 * @param {Object} meta - Metadados adicionais (paginação, etc.)
 */
const sendSuccess = (res, statusCode = 200, message = 'Operação realizada com sucesso', data = null, meta = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (meta !== null) {
    response.meta = meta;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Função para criar respostas de erro padronizadas
 * 
 * @param {Object} res - Objeto response do Express
 * @param {number} statusCode - Código de status HTTP
 * @param {string} message - Mensagem de erro
 * @param {*} error - Detalhes do erro (apenas em desenvolvimento)
 */
const sendError = (res, statusCode = 500, message = 'Erro interno do servidor', error = null) => {
  const response = {
    success: false,
    error: message
  };
  
  // Incluir detalhes do erro apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development' && error) {
    response.errorDetails = {
      message: error.message,
      stack: error.stack
    };
  }
  
  res.status(statusCode).json(response);
};

/**
 * Função para validar se um ID é um UUID válido
 * 
 * @param {string} id - ID a ser validado
 * @returns {boolean} - True se for um UUID válido
 */
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Função para sanitizar dados de entrada removendo campos sensíveis
 * 
 * @param {Object} data - Dados a serem sanitizados
 * @param {Array} fieldsToRemove - Campos a serem removidos
 * @returns {Object} - Dados sanitizados
 */
const sanitizeData = (data, fieldsToRemove = ['password', 'token', 'secret']) => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = { ...data };
  
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
};

/**
 * Função para criar metadados de paginação
 * 
 * @param {number} page - Página atual
 * @param {number} limit - Limite por página
 * @param {number} total - Total de registros
 * @returns {Object} - Metadados de paginação
 */
const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  catchAsync,
  AppError,
  sendSuccess,
  sendError,
  isValidUUID,
  sanitizeData,
  createPaginationMeta
};