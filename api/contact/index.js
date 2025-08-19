const { setCorsHeaders, rateLimit, checkMethod, validate, catchAsync } = require('../_lib/middleware');
const { createContact, getAllContacts } = require('../_lib/supabase');
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

// Função para enviar email de notificação
async function sendNotificationEmail(contactData) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_EMAIL,
    subject: `Novo contato: ${contactData.subject}`,
    html: `
      <h2>Novo contato recebido</h2>
      <p><strong>Nome:</strong> ${contactData.name}</p>
      <p><strong>Email:</strong> ${contactData.email}</p>
      <p><strong>Telefone:</strong> ${contactData.phone}</p>
      <p><strong>Assunto:</strong> ${contactData.subject}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${contactData.message}</p>
      <hr>
      <p><em>Enviado em: ${new Date().toLocaleString('pt-BR')}</em></p>
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
    // Validar dados do contato
    const validatedData = validate(req.body, 'contact', res);
    if (!validatedData) return;

    // Criar contato no banco
    const contact = await createContact(validatedData);
    
    // Enviar email de notificação (não bloquear se falhar)
    try {
      await sendNotificationEmail(validatedData);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Contato enviado com sucesso',
      data: contact
    });

  } else if (req.method === 'GET') {
    // Buscar todos os contatos (admin)
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const result = await getAllContacts(page, limit);

    res.status(200).json({
      success: true,
      message: 'Contatos encontrados com sucesso',
      data: result
    });
  }
});