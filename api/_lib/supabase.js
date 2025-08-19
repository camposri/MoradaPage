const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
    }
    
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }
  
  return supabaseClient;
}

// Função para buscar propriedades com filtros
async function searchProperties(filters) {
  const supabase = getSupabaseClient();
  const { page = 1, limit = 10, ...searchFilters } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Aplicar filtros
  if (searchFilters.type) {
    query = query.eq('type', searchFilters.type);
  }

  if (searchFilters.city) {
    query = query.ilike('city', `%${searchFilters.city}%`);
  }

  if (searchFilters.minPrice) {
    query = query.gte('price', searchFilters.minPrice);
  }

  if (searchFilters.maxPrice) {
    query = query.lte('price', searchFilters.maxPrice);
  }

  if (searchFilters.bedrooms) {
    query = query.eq('bedrooms', searchFilters.bedrooms);
  }

  if (searchFilters.bathrooms) {
    query = query.eq('bathrooms', searchFilters.bathrooms);
  }

  if (searchFilters.area) {
    query = query.gte('area', searchFilters.area);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil(count / limit);

  return {
    properties: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// Função para buscar propriedades em destaque
async function getFeaturedProperties(limit = 6) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

// Função para buscar propriedade por ID
async function getPropertyById(id) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Não encontrado
    }
    throw error;
  }

  return data;
}

// Função para buscar propriedades similares
async function getSimilarProperties(propertyId, limit = 4) {
  const supabase = getSupabaseClient();
  
  // Primeiro, buscar a propriedade atual para obter seus dados
  const currentProperty = await getPropertyById(propertyId);
  
  if (!currentProperty) {
    return [];
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('active', true)
    .neq('id', propertyId)
    .or(`type.eq.${currentProperty.type},city.ilike.%${currentProperty.city}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

// Função para criar contato
async function createContact(contactData) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('contacts')
    .insert([{
      ...contactData,
      status: 'pending',
      read: false,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Função para buscar todos os contatos
async function getAllContacts(page = 1, limit = 10) {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil(count / limit);

  return {
    contacts: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// Função para agendar visita
async function scheduleVisit(visitData) {
  const supabase = getSupabaseClient();
  
  // Verificar se a propriedade existe
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, title')
    .eq('id', visitData.propertyId)
    .eq('active', true)
    .single();

  if (propertyError || !property) {
    throw new Error('Propriedade não encontrada');
  }

  // Verificar disponibilidade do horário
  const visitDateTime = new Date(`${visitData.visitDate}T${visitData.visitTime}:00`);
  
  const { data: existingVisit } = await supabase
    .from('visits')
    .select('id')
    .eq('property_id', visitData.propertyId)
    .eq('visit_date', visitDateTime.toISOString())
    .in('status', ['scheduled', 'confirmed'])
    .single();

  if (existingVisit) {
    throw new Error('Horário não disponível. Por favor, escolha outro horário.');
  }

  // Criar a visita
  const { data, error } = await supabase
    .from('visits')
    .insert([{
      name: visitData.name,
      email: visitData.email,
      phone: visitData.phone,
      property_id: visitData.propertyId,
      visit_date: visitDateTime.toISOString(),
      message: visitData.message || '',
      status: 'scheduled',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { ...data, property };
}

// Função para buscar todas as visitas
async function getAllVisits(page = 1, limit = 10) {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('visits')
    .select(`
      *,
      properties:property_id (
        id,
        title,
        address,
        city
      )
    `, { count: 'exact' })
    .order('visit_date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil(count / limit);

  return {
    visits: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// Função para verificar disponibilidade de horários
async function checkAvailability(propertyId, date) {
  const supabase = getSupabaseClient();
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('visits')
    .select('visit_date')
    .eq('property_id', propertyId)
    .gte('visit_date', startOfDay.toISOString())
    .lte('visit_date', endOfDay.toISOString())
    .in('status', ['scheduled', 'confirmed']);

  if (error) {
    throw error;
  }

  // Horários disponíveis (9h às 18h)
  const availableSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    const isBooked = data.some(visit => {
      const visitTime = new Date(visit.visit_date);
      return visitTime.getHours() === hour;
    });
    
    if (!isBooked) {
      availableSlots.push(timeSlot);
    }
  }

  return availableSlots;
}

module.exports = {
  getSupabaseClient,
  searchProperties,
  getFeaturedProperties,
  getPropertyById,
  getSimilarProperties,
  createContact,
  getAllContacts,
  scheduleVisit,
  getAllVisits,
  checkAvailability
};