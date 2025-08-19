module.exports = async (req, res) => {
  console.log('=== PROPERTIES INDEX DEBUG ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    if (req.method === 'POST') {
      // Criar nova propriedade
      console.log('Creating new property with data:', req.body);
      
      // Validação básica
      if (!req.body.title || !req.body.price) {
        return res.status(400).json({
          success: false,
          error: 'Título e preço são obrigatórios'
        });
      }
      
      // Por enquanto, retornar sucesso simulado
      const newProperty = {
        id: Date.now().toString(),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Property created successfully:', newProperty);
      
      return res.status(201).json({
        success: true,
        message: 'Propriedade criada com sucesso',
        data: newProperty
      });
      
    } else if (req.method === 'GET') {
      // Listar propriedades
      return res.status(200).json({
        success: true,
        message: 'Propriedades listadas com sucesso',
        data: {
          properties: [],
          total: 0
        }
      });
      
    } else {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }
    
  } catch (error) {
    console.error('Error in properties function:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};