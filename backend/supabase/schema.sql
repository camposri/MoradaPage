-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(100) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  area DECIMAL(8,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  location VARCHAR(255) NOT NULL,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visits table
CREATE TABLE visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20),
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_created_at ON properties(created_at);

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_visit_date ON visits(visit_date);
CREATE INDEX idx_visits_created_at ON visits(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO properties (title, description, property_type, price, area, bedrooms, bathrooms, location, images, featured) VALUES
('Casa Moderna no Centro', 'Bela casa com 3 quartos e 2 banheiros, localizada no centro da cidade com fácil acesso a comércios e serviços.', 'Casa', 450000.00, 120.50, 3, 2, 'Centro, São Paulo - SP', ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], true),
('Apartamento Luxuoso', 'Apartamento de alto padrão com vista para o mar, 2 quartos, 1 banheiro e varanda gourmet.', 'Apartamento', 680000.00, 85.00, 2, 1, 'Copacabana, Rio de Janeiro - RJ', ARRAY['https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], true),
('Terreno Comercial', 'Excelente terreno para investimento comercial, localizado em área de grande movimento.', 'Terreno', 320000.00, 500.00, NULL, NULL, 'Zona Industrial, Campinas - SP', ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], false),
('Sobrado Familiar', 'Amplo sobrado com 4 quartos, 3 banheiros, quintal e garagem para 2 carros.', 'Casa', 520000.00, 180.00, 4, 3, 'Vila Madalena, São Paulo - SP', ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], false),
('Studio Moderno', 'Studio compacto e moderno, ideal para jovens profissionais, com mobília planejada.', 'Apartamento', 280000.00, 35.00, 1, 1, 'Pinheiros, São Paulo - SP', ARRAY['https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], true);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to properties
CREATE POLICY "Properties are viewable by everyone" ON properties
    FOR SELECT USING (true);

-- Create policies for authenticated users to manage properties
CREATE POLICY "Authenticated users can insert properties" ON properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update properties" ON properties
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete properties" ON properties
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for contacts (public can insert, authenticated can read/update/delete)
CREATE POLICY "Anyone can submit contacts" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contacts" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete contacts" ON contacts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for visits (public can insert, authenticated can manage)
CREATE POLICY "Anyone can schedule visits" ON visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view visits" ON visits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update visits" ON visits
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete visits" ON visits
    FOR DELETE USING (auth.role() = 'authenticated');