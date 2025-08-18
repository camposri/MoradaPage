-- Morada Premium - Estrutura das Tabelas do Supabase
-- Execute estes comandos no SQL Editor do seu projeto Supabase

-- =============================================
-- TABELA: properties
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10,2),
  property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('casa', 'apartamento', 'cobertura', 'terreno', 'comercial')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_deleted ON properties(deleted_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABELA: contacts
-- =============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(is_read);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABELA: visits
-- =============================================
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20) NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visits_property ON visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_email ON visits(visitor_email);
CREATE INDEX IF NOT EXISTS idx_visits_datetime ON visits(visit_date, visit_time);

-- Trigger para updated_at
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Constraint para evitar agendamentos duplicados no mesmo horário
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_unique_datetime 
    ON visits(visit_date, visit_time) 
    WHERE status IN ('scheduled', 'confirmed');

-- =============================================
-- TABELA: chat_sessions
-- =============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'human_transfer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  close_reason VARCHAR(100)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_activity ON chat_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at);

-- =============================================
-- TABELA: chat_messages
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'bot', 'admin')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- =============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =============================================

-- Inserir algumas propriedades de exemplo
INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, area, property_type, featured, images, amenities) VALUES
('Casa Moderna em Condomínio Fechado', 'Belíssima casa com acabamento de primeira qualidade, localizada em condomínio fechado com segurança 24h. Possui ampla área de lazer com piscina, churrasqueira e jardim.', 850000.00, 'Alphaville, São Paulo', 4, 3, 280.50, 'casa', true, '["https://example.com/image1.jpg", "https://example.com/image2.jpg"]', '["Piscina", "Churrasqueira", "Jardim", "Garagem para 2 carros", "Segurança 24h"]'),

('Apartamento de Luxo Vista Mar', 'Apartamento de alto padrão com vista panorâmica para o mar. Localizado em uma das melhores regiões da cidade, com fácil acesso a shopping centers e restaurantes.', 1200000.00, 'Barra da Tijuca, Rio de Janeiro', 3, 2, 120.00, 'apartamento', true, '["https://example.com/image3.jpg", "https://example.com/image4.jpg"]', '["Vista para o mar", "Varanda gourmet", "Academia", "Piscina", "Sauna"]'),

('Cobertura Duplex Premium', 'Cobertura duplex com terraço privativo e piscina. Acabamento impecável e localização privilegiada no coração da cidade.', 2500000.00, 'Ipanema, Rio de Janeiro', 5, 4, 350.00, 'cobertura', true, '["https://example.com/image5.jpg", "https://example.com/image6.jpg"]', '["Terraço privativo", "Piscina privativa", "Churrasqueira", "Vista panorâmica", "Elevador privativo"]'),

('Casa de Campo Exclusiva', 'Casa de campo em terreno amplo com muito verde e tranquilidade. Ideal para quem busca qualidade de vida longe da agitação urbana.', 650000.00, 'Campos do Jordão, São Paulo', 3, 2, 200.00, 'casa', false, '["https://example.com/image7.jpg", "https://example.com/image8.jpg"]', '["Lareira", "Jardim amplo", "Horta", "Garagem", "Área de lazer"]'),

('Apartamento Compacto Centro', 'Apartamento moderno e funcional no centro da cidade. Perfeito para jovens profissionais que valorizam localização e praticidade.', 380000.00, 'Centro, São Paulo', 2, 1, 65.00, 'apartamento', false, '["https://example.com/image9.jpg", "https://example.com/image10.jpg"]', '["Localização central", "Transporte público", "Academia", "Lavanderia"]');

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================

-- Habilitar RLS nas tabelas (opcional, para maior segurança)
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (exemplo para leitura pública de propriedades)
-- CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (deleted_at IS NULL);

-- =============================================
-- FUNÇÕES ÚTEIS
-- =============================================

-- Função para buscar propriedades similares
CREATE OR REPLACE FUNCTION get_similar_properties(property_id UUID, limit_count INTEGER DEFAULT 4)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  price DECIMAL,
  location VARCHAR,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL,
  property_type VARCHAR,
  images JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.location,
    p.bedrooms,
    p.bathrooms,
    p.area,
    p.property_type,
    p.images
  FROM properties p
  WHERE p.id != property_id 
    AND p.deleted_at IS NULL 
    AND p.status = 'available'
    AND p.property_type = (SELECT property_type FROM properties WHERE properties.id = property_id)
  ORDER BY 
    ABS(p.price - (SELECT price FROM properties WHERE properties.id = property_id)),
    p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de propriedades
CREATE OR REPLACE FUNCTION get_property_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'available', COUNT(*) FILTER (WHERE status = 'available'),
    'sold', COUNT(*) FILTER (WHERE status = 'sold'),
    'featured', COUNT(*) FILTER (WHERE featured = true),
    'by_type', json_object_agg(property_type, type_count)
  ) INTO result
  FROM (
    SELECT 
      property_type,
      COUNT(*) as type_count
    FROM properties 
    WHERE deleted_at IS NULL
    GROUP BY property_type
  ) type_stats,
  properties
  WHERE properties.deleted_at IS NULL;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- Este arquivo contém toda a estrutura necessária para o banco de dados
-- da aplicação Morada Premium. Execute os comandos na ordem apresentada
-- no SQL Editor do seu projeto Supabase.
--
-- Lembre-se de:
-- 1. Configurar as variáveis de ambiente no arquivo .env
-- 2. Ajustar as URLs das imagens de exemplo
-- 3. Configurar as políticas de segurança conforme necessário
-- 4. Fazer backup regular dos dados
--
-- Para mais informações, consulte o README.md do projeto.