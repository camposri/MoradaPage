const { setCorsHeaders, rateLimit, checkMethod, validate, catchAsync } = require('../_lib/middleware');
const { scheduleVisit, getAllVisits, checkAvailability } = require('../_lib/supabase');
const nodemailer = require('nodemailer');

// Configuração do Nodemailer
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Função para enviar email de confirmação
async function sendVisitConfirmationEmail(visitData, propertyData) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: visitData.email,
    subject: 'Confirmação de Agendamento de Visita',
    html: `
      <h2>Visita Agendada com Sucesso!</h2>
      <p>Olá ${visitData.name},</p>
      <p>Sua visita foi agendada com sucesso para:</p>
      <ul>
        <li><strong>Propriedade:</strong> ${propertyData.title}</li>
        <li><strong>Endereço:</strong> ${propertyData.address}</li>
        <li><strong>Data:</strong> ${new Date(visitData.visitDate).toLocaleDateString('pt-BR')}</li>
        <li><strong>Horário:</strong> ${visitData.visitTime}</li>
      </ul>
      <p>Entraremos em contato em breve para confirmar os detalhes.</p>
      <hr>
      <p><em>Morada Imóveis</em></p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = catchAsync(async (req, res) => {
  // Configurar CORS
  setCorsHeaders(res);
  
  // Verificar método HTTP
  if (!checkMethod(req, res, ['GET', 'POST'])) return;
  
  // Aplicar rate limiting
  const rateLimiter = rateLimit();
  if (!rateLimiter(req, res)) return;

  if (req.method === 'POST') {
    // Validar dados da visita
    const validatedData = validate(req.body, 'visit', res);
    if (!validatedData) return;

    // Agendar visita
    const result = await scheduleVisit(validatedData);
    
    // Enviar email de confirmação (não bloquear se falhar)
    try {
      await sendVisitConfirmationEmail(validatedData, result.property);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Visita agendada com sucesso! Você receberá um email de confirmação.',
      data: result
    });

  } else if (req.method === 'GET') {
    const { propertyId, date } = req.query;
    
    if (propertyId && date) {
      // Verificar disponibilidade
      const availableSlots = await checkAvailability(propertyId, date);
      
      res.status(200).json({
        success: true,
        message: 'Horários disponíveis encontrados',
        data: { availableSlots }
      });
    } else {
      // Buscar todas as visitas (admin)
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      const result = await getAllVisits(page, limit);

      res.status(200).json({
        success: true,
        message: 'Visitas encontradas com sucesso',
        data: result
      });
    }
  }
});