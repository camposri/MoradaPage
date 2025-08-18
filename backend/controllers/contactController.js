const Contact = require('../models/Contact');
const { catchAsync } = require('../utils/catchAsync');
const emailService = require('../services/emailService');

// Criar novo contato
const createContact = catchAsync(async (req, res) => {
  const { name, email, phone, message, subject } = req.body;
  
  const contactData = {
    name,
    email,
    phone,
    message,
    subject: subject || 'Contato via site',
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  };

  const contact = await Contact.create(contactData);

  // Enviar email de notificação para o admin
  try {
    await emailService.sendNewContactNotification(contact);
  } catch (emailError) {
    console.error('Erro ao enviar email de notificação:', emailError);
    // Não falha a requisição se o email não for enviado
  }

  // Enviar email de confirmação para o cliente
  try {
    await emailService.sendContactConfirmation(contact);
  } catch (emailError) {
    console.error('Erro ao enviar email de confirmação:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    data: {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      created_at: contact.created_at
    }
  });
});

// Buscar todos os contatos (admin)
const getAllContacts = catchAsync(async (req, res) => {
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

  const result = await Contact.findAll(filters);

  res.status(200).json({
    success: true,
    message: 'Contatos encontrados com sucesso',
    data: result
  });
});

// Buscar contato por ID (admin)
const getContactById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contato não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contato encontrado com sucesso',
    data: contact
  });
});

// Atualizar status do contato (admin)
const updateContactStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const validStatuses = ['new', 'read', 'responded', 'closed'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Status inválido. Use: new, read, responded ou closed'
    });
  }

  const contact = await Contact.updateStatus(id, status, notes);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contato não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Status do contato atualizado com sucesso',
    data: contact
  });
});

// Marcar contato como lido (admin)
const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const contact = await Contact.markAsRead(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contato não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contato marcado como lido',
    data: contact
  });
});

// Responder contato (admin)
const respondContact = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { response, sendEmail } = req.body;
  
  if (!response) {
    return res.status(400).json({
      success: false,
      error: 'Resposta é obrigatória'
    });
  }

  // Buscar o contato
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contato não encontrado'
    });
  }

  // Atualizar status para respondido
  const updatedContact = await Contact.updateStatus(id, 'responded', response);

  // Enviar email de resposta se solicitado
  if (sendEmail) {
    try {
      await emailService.sendContactResponse(contact, response);
    } catch (emailError) {
      console.error('Erro ao enviar email de resposta:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Contato atualizado, mas erro ao enviar email de resposta'
      });
    }
  }

  res.status(200).json({
    success: true,
    message: sendEmail ? 'Resposta enviada com sucesso' : 'Resposta salva com sucesso',
    data: updatedContact
  });
});

// Deletar contato (admin)
const deleteContact = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const contact = await Contact.delete(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contato não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contato deletado com sucesso',
    data: contact
  });
});

// Obter estatísticas de contatos (admin)
const getStats = catchAsync(async (req, res) => {
  const stats = await Contact.getStats();

  res.status(200).json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
});

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  markAsRead,
  respondContact,
  deleteContact,
  getStats
};