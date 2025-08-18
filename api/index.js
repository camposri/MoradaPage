// Vercel Serverless Function - API Proxy
const fetch = require('node-fetch');

// URL do backend (configurar nas variáveis de ambiente da Vercel)
const BACKEND_URL = process.env.BACKEND_URL || 'https://sua-api-backend.railway.app';

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extrair o path da API (remover /api do início)
    const apiPath = req.url;
    const targetUrl = `${BACKEND_URL}${apiPath}`;
    
    console.log(`Proxying ${req.method} request to: ${targetUrl}`);
    
    // Preparar headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Vercel-Proxy/1.0'
    };
    
    // Preparar body para requests que não são GET
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      body = JSON.stringify(req.body);
    }
    
    // Fazer a requisição para o backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body
    });
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      res.status(response.status).json(data);
    } else {
      data = await response.text();
      res.status(response.status).send(data);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to connect to backend API',
      details: error.message,
      backend_url: BACKEND_URL
    });
  }
};