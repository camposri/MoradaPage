const nodemailer = require('nodemailer');

/**
 * Configuração do transportador de email
 */
const createTransporter = () => {
  // Configuração para Gmail (pode ser alterada para outros provedores)
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password para Gmail
    }
  });
};

/**
 * Templates de email
 */
const emailTemplates = {
  // Template para confirmação de contato
  contactConfirmation: (name) => ({
    subject: 'Confirmação de Contato - Morada Premium',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Morada Premium</h1>
          <p style="color: white; margin: 10px 0 0 0;">Imóveis de Alto Padrão</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Olá, ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Obrigado por entrar em contato conosco! Recebemos sua mensagem e nossa equipe entrará em contato em breve.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Na Morada Premium, trabalhamos com os melhores imóveis de alto padrão da região. 
            Valmike Junior e sua equipe estão prontos para ajudá-lo a encontrar o imóvel dos seus sonhos.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Nossos Serviços:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Venda de imóveis de alto padrão</li>
              <li>Consultoria imobiliária especializada</li>
              <li>Avaliação profissional de imóveis</li>
              <li>Acompanhamento completo do processo</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Atenciosamente,<br>
            <strong>Equipe Morada Premium</strong>
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #ccc; margin: 0; font-size: 14px;">
            © 2024 Morada Premium - Todos os direitos reservados
          </p>
        </div>
      </div>
    `
  }),

  // Template para notificação de novo contato (admin)
  newContactNotification: (contact) => ({
    subject: `Novo Contato - ${contact.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Novo Contato Recebido</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Detalhes do Contato:</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <p><strong>Nome:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Telefone:</strong> ${contact.phone || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date(contact.created_at).toLocaleString('pt-BR')}</p>
            
            <h3>Mensagem:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px;">
              ${contact.message}
            </div>
          </div>
        </div>
      </div>
    `
  }),

  // Template para confirmação de agendamento de visita
  visitConfirmation: (visit, property) => ({
    subject: 'Confirmação de Agendamento - Morada Premium',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Visita Agendada</h1>
          <p style="color: white; margin: 10px 0 0 0;">Morada Premium</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Olá, ${visit.visitor_name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Sua visita foi agendada com sucesso! Confira os detalhes abaixo:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalhes da Visita:</h3>
            <p><strong>Imóvel:</strong> ${property?.title || 'Imóvel não especificado'}</p>
            <p><strong>Data:</strong> ${new Date(visit.visit_date).toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${visit.visit_time}</p>
            <p><strong>Status:</strong> ${visit.status === 'scheduled' ? 'Agendada' : visit.status}</p>
            
            ${visit.notes ? `<p><strong>Observações:</strong> ${visit.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/visit/confirm/${visit.id}" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirmar Visita
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            <strong>Importante:</strong> Por favor, confirme sua presença clicando no botão acima. 
            Em caso de cancelamento, entre em contato conosco com antecedência.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Atenciosamente,<br>
            <strong>Valmike Junior</strong><br>
            Morada Premium
          </p>
        </div>
      </div>
    `
  }),

  // Template para notificação de nova visita (admin)
  newVisitNotification: (visit, property) => ({
    subject: `Nova Visita Agendada - ${visit.visitor_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #17a2b8; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nova Visita Agendada</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Detalhes da Visita:</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <p><strong>Visitante:</strong> ${visit.visitor_name}</p>
            <p><strong>Email:</strong> ${visit.visitor_email}</p>
            <p><strong>Telefone:</strong> ${visit.visitor_phone}</p>
            <p><strong>Data:</strong> ${new Date(visit.visit_date).toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${visit.visit_time}</p>
            <p><strong>Imóvel:</strong> ${property?.title || 'ID: ' + visit.property_id}</p>
            
            ${visit.notes ? `
              <h3>Observações:</h3>
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
                ${visit.notes}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `
  })
};

/**
 * Classe principal do serviço de email
 */
class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Inicializa o transportador de email
   */
  async initialize() {
    try {
      this.transporter = createTransporter();
      
      // Verificar conexão
      await this.transporter.verify();
      console.log('✅ Serviço de email inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de email:', error.message);
      // Não lançar erro para não quebrar a aplicação
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(to, subject, html, from = null) {
    if (!this.transporter) {
      console.warn('⚠️ Transportador de email não inicializado');
      return false;
    }

    try {
      const mailOptions = {
        from: from || `"Morada Premium" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado com sucesso:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      return false;
    }
  }

  /**
   * Enviar confirmação de contato
   */
  async sendContactConfirmation(contact) {
    const template = emailTemplates.contactConfirmation(contact.name);
    return await this.sendEmail(contact.email, template.subject, template.html);
  }

  /**
   * Enviar notificação de novo contato para admin
   */
  async sendNewContactNotification(contact) {
    const template = emailTemplates.newContactNotification(contact);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    return await this.sendEmail(adminEmail, template.subject, template.html);
  }

  /**
   * Enviar confirmação de agendamento de visita
   */
  async sendVisitConfirmation(visit, property = null) {
    const template = emailTemplates.visitConfirmation(visit, property);
    return await this.sendEmail(visit.visitor_email, template.subject, template.html);
  }

  /**
   * Enviar notificação de nova visita para admin
   */
  async sendNewVisitNotification(visit, property = null) {
    const template = emailTemplates.newVisitNotification(visit, property);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    return await this.sendEmail(adminEmail, template.subject, template.html);
  }

  /**
   * Enviar resposta personalizada para contato
   */
  async sendContactReply(contact, replyMessage, subject = null) {
    const emailSubject = subject || `Re: Contato - Morada Premium`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Morada Premium</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Olá, ${contact.name}!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Atenciosamente,<br>
            <strong>Valmike Junior</strong><br>
            Morada Premium
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(contact.email, emailSubject, html);
  }
}

// Criar instância única do serviço
const emailService = new EmailService();

module.exports = emailService;