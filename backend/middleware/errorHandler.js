const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('❌ Erro:', err);

  // Erro de validação do Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      message,
      details: err.details
    });
  }

  // Erro do Supabase
  if (err.code) {
    let message = 'Erro interno do servidor';
    let statusCode = 500;

    switch (err.code) {
      case '23505': // Unique violation
        message = 'Registro já existe';
        statusCode = 409;
        break;
      case '23503': // Foreign key violation
        message = 'Referência inválida';
        statusCode = 400;
        break;
      case '23502': // Not null violation
        message = 'Campo obrigatório não informado';
        statusCode = 400;
        break;
      case 'PGRST116': // No rows found
        message = 'Registro não encontrado';
        statusCode = 404;
        break;
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { details: err })
    });
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado'
    });
  }

  // Erro padrão
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;