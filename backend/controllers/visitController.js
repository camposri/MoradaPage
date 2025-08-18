const Visit = require('../models/Visit');
const Property = require('../models/Property');
const { catchAsync } = require('../utils/catchAsync');
const emailService = require('../services/emailService');

// Agendar nova visita
const scheduleVisit = catchAsync(async (req, res) => {
  const { propertyId, name, email, phone, preferredDate, preferredTime, message } = req.body;
  
  // Verificar se a propriedade existe
  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Propriedade não encontrada'
    });
  }

  // Verificar disponibilidade do horário
  const isAvailable = await Visit.checkAvailability(preferredDate, preferredTime);
  if (!isAvailable) {
    return res.status(409).json({
      success: false,
      error: 'Horário não disponível. Por favor, escolha outro horário.'
    });
  }

  const visitData = {
    property_id: propertyId,
    name,
    email,
    phone,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    message: message || null,
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  };

  const visit = await Visit.create(visitData);

  // Enviar email de notificação para o admin
  try {
    await emailService.sendVisitNotification(visit);
  } catch (emailError) {
    console.error('Erro ao enviar email de notificação:', emailError);
  }

  // Enviar email de confirmação para o cliente
  try {
    await emailService.sendVisitConfirmation(visit);
  } catch (emailError) {
    console.error('Erro ao enviar email de confirmação:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Visita agendada com sucesso! Entraremos em contato para confirmar.',
    data: {
      id: visit.id,
      property: visit.properties,
      name: visit.name,
      email: visit.email,
      preferred_date: visit.preferred_date,
      preferred_time: visit.preferred_time,
      status: visit.status,
      created_at: visit.created_at
    }
  });
});

// Buscar todas as visitas (admin)
const getAllVisits = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status,
    date: req.query.date,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    propertyId: req.query.propertyId,
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 20
  };

  // Remove filtros undefined
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  const result = await Visit.findAll(filters);

  res.status(200).json({
    success: true,
    message: 'Visitas encontradas com sucesso',
    data: result
  });
});

// Buscar visita por ID
const getVisitById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const visit = await Visit.findById(id);
  
  if (!visit) {
    return res.status(404).json({
      success: false,
      error: 'Visita não encontrada'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Visita encontrada com sucesso',
    data: visit
  });
});

// Buscar visitas por email do cliente
const getVisitsByEmail = catchAsync(async (req, res) => {
  const { email } = req.params;
  
  const visits = await Visit.findByEmail(email);

  res.status(200).json({
    success: true,
    message: 'Visitas encontradas com sucesso',
    data: visits
  });
});

// Atualizar status da visita (admin)
const updateVisitStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Status inválido. Use: pending, confirmed, completed, cancelled ou rescheduled'
    });
  }

  const visit = await Visit.updateStatus(id, status, notes);

  if (!visit) {
    return res.status(404).json({
      success: false,
      error: 'Visita não encontrada'
    });
  }

  // Enviar email de atualização para o cliente
  try {
    await emailService.sendVisitStatusUpdate(visit, status);
  } catch (emailError) {
    console.error('Erro ao enviar email de atualização:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Status da visita atualizado com sucesso',
    data: visit
  });
});

// Confirmar visita (admin)
const confirmVisit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  const visit = await Visit.updateStatus(id, 'confirmed', notes);

  if (!visit) {
    return res.status(404).json({
      success: false,
      error: 'Visita não encontrada'
    });
  }

  // Enviar email de confirmação
  try {
    await emailService.sendVisitConfirmed(visit);
  } catch (emailError) {
    console.error('Erro ao enviar email de confirmação:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Visita confirmada com sucesso',
    data: visit
  });
});

// Reagendar visita
const rescheduleVisit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newDate, newTime, reason } = req.body;
  
  if (!newDate || !newTime) {
    return res.status(400).json({
      success: false,
      error: 'Nova data e horário são obrigatórios'
    });
  }

  // Verificar disponibilidade do novo horário
  const isAvailable = await Visit.checkAvailability(newDate, newTime, id);
  if (!isAvailable) {
    return res.status(409).json({
      success: false,
      error: 'Novo horário não disponível. Por favor, escolha outro horário.'
    });
  }

  const visit = await Visit.reschedule(id, newDate, newTime, reason);

  if (!visit) {
    return res.status(404).json({
      success: false,
      error: 'Visita não encontrada'
    });
  }

  // Enviar email de reagendamento
  try {
    await emailService.sendVisitRescheduled(visit);
  } catch (emailError) {
    console.error('Erro ao enviar email de reagendamento:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Visita reagendada com sucesso',
    data: visit
  });
});

// Cancelar visita
const cancelVisit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const visit = await Visit.updateStatus(id, 'cancelled', reason);

  if (!visit) {
    return res.status(404).json({
      success: false,
      error: 'Visita não encontrada'
    });
  }

  // Enviar email de cancelamento
  try {
    await emailService.sendVisitCancelled(visit);
  } catch (emailError) {
    console.error('Erro ao enviar email de cancelamento:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Visita cancelada com sucesso',
    data: visit
  });
});

// Verificar disponibilidade de horário
const checkAvailability = catchAsync(async (req, res) => {
  const { date, time } = req.query;
  
  if (!date || !time) {
    return res.status(400).json({
      success: false,
      error: 'Data e horário são obrigatórios'
    });
  }

  const isAvailable = await Visit.checkAvailability(date, time);

  res.status(200).json({
    success: true,
    message: 'Disponibilidade verificada',
    data: {
      date,
      time,
      available: isAvailable
    }
  });
});

// Obter visitas do dia (admin)
const getTodayVisits = catchAsync(async (req, res) => {
  const visits = await Visit.getTodayVisits();

  res.status(200).json({
    success: true,
    message: 'Visitas do dia encontradas com sucesso',
    data: visits
  });
});

// Obter estatísticas de visitas (admin)
const getStats = catchAsync(async (req, res) => {
  const stats = await Visit.getStats();

  res.status(200).json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
});

// Deletar visita (admin)
const deleteVisit = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const visit = await Visit.delete(id);

  if (!visit) {
    return res.status(404).json({
      success: false,
      error: 'Visita não encontrada'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Visita deletada com sucesso',
    data: visit
  });
});

module.exports = {
  scheduleVisit,
  getAllVisits,
  getVisitById,
  getVisitsByEmail,
  updateVisitStatus,
  confirmVisit,
  rescheduleVisit,
  cancelVisit,
  checkAvailability,
  getTodayVisits,
  getStats,
  deleteVisit
};