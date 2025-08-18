// Script de teste para as APIs do backend
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Função para testar o health check
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', response.data);
  } catch (error) {
    console.log('❌ Health Check falhou:', error.message);
  }
}

// Função para testar busca de propriedades
async function testPropertySearch() {
  try {
    const response = await axios.get(`${BASE_URL}/properties`, {
      params: {
        page: 1,
        limit: 5,
        type: 'casa'
      }
    });
    console.log('✅ Busca de Propriedades:', {
      success: response.data.success,
      total: response.data.data?.length || 0,
      message: response.data.message
    });
  } catch (error) {
    console.log('❌ Busca de Propriedades falhou:', error.response?.data || error.message);
  }
}

// Função para testar criação de contato
async function testCreateContact() {
  try {
    const contactData = {
      name: 'João Silva',
      email: 'joao@teste.com',
      phone: '(44) 99999-9999',
      message: 'Gostaria de mais informações sobre os imóveis disponíveis.',
      subject: 'Interesse em imóveis'
    };
    
    const response = await axios.post(`${BASE_URL}/contact`, contactData);
    console.log('✅ Criação de Contato:', {
      success: response.data.success,
      message: response.data.message,
      id: response.data.data?.id
    });
  } catch (error) {
    console.log('❌ Criação de Contato falhou:', error.response?.data || error.message);
  }
}

// Função para testar agendamento de visita
async function testScheduleVisit() {
  try {
    const visitData = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000', // UUID de exemplo
      name: 'Maria Santos',
      email: 'maria@teste.com',
      phone: '(44) 88888-8888',
      preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      preferredTime: '14:00',
      message: 'Gostaria de agendar uma visita para conhecer o imóvel.'
    };
    
    const response = await axios.post(`${BASE_URL}/visits`, visitData);
    console.log('✅ Agendamento de Visita:', {
      success: response.data.success,
      message: response.data.message,
      id: response.data.data?.id
    });
  } catch (error) {
    console.log('❌ Agendamento de Visita falhou:', error.response?.data || error.message);
  }
}

// Função para testar chat
async function testChat() {
  try {
    // Primeiro, iniciar uma sessão
    const sessionResponse = await axios.post(`${BASE_URL}/chat/session`);
    const sessionId = sessionResponse.data.data.id;
    
    console.log('✅ Sessão de Chat criada:', {
      success: sessionResponse.data.success,
      sessionId: sessionId
    });
    
    // Depois, enviar uma mensagem
    const messageData = {
      message: 'Olá, gostaria de informações sobre imóveis.',
      sessionId: sessionId
    };
    
    const messageResponse = await axios.post(`${BASE_URL}/chat/message`, messageData);
    console.log('✅ Mensagem de Chat enviada:', {
      success: messageResponse.data.success,
      message: messageResponse.data.message
    });
  } catch (error) {
    console.log('❌ Chat falhou:', error.response?.data || error.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🧪 Iniciando testes das APIs...\n');
  
  await testHealthCheck();
  console.log('');
  
  await testPropertySearch();
  console.log('');
  
  await testCreateContact();
  console.log('');
  
  await testScheduleVisit();
  console.log('');
  
  await testChat();
  console.log('');
  
  console.log('🏁 Testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testPropertySearch,
  testCreateContact,
  testScheduleVisit,
  testChat,
  runAllTests
};