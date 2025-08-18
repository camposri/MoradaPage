const supabase = require('../config/supabase');

class Property {
  constructor() {
    this.tableName = 'properties';
  }

  // Buscar propriedades com filtros
  async search(filters = {}) {
    try {
      let query = supabase.from('properties').select('*').eq('status', 'available');
      
      // Aplicar filtros
      if (filters.type) {
        query = query.eq('property_type', filters.type);
      }

      if (filters.city) {
        query = query.ilike('location', `%${filters.city}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      if (filters.area) {
        query = query.gte('area', filters.area);
      }

      // Filtro para imóveis em destaque
      if (filters.featured === 'true' || filters.featured === true) {
        query = query.eq('featured', true);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        properties: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Buscar propriedade por ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar propriedades em destaque
  async getFeatured(limit = 6) {
    try {
      // Mock implementation para desenvolvimento local
      const featuredProperties = mockProperties
        .filter(p => p.featured && p.status === 'available')
        .slice(0, limit);
      return featuredProperties;
    } catch (error) {
      throw error;
    }
  }

  // Buscar propriedades similares
  async getSimilar(propertyId, type, city, limit = 4) {
    try {
      // Mock implementation para desenvolvimento local
      const similarProperties = mockProperties
        .filter(p => p.property_type === type && p.id != propertyId && p.status === 'available' && p.location.includes(city))
        .slice(0, limit);
      return similarProperties;
    } catch (error) {
      throw error;
    }
  }

  // Criar nova propriedade (para admin)
  async create(propertyData) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar propriedade (para admin)
  async update(id, propertyData) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Deletar propriedade (soft delete)
  async delete(id) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ status: 'sold' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Obter estatísticas
  async getStats() {
    try {
      // Mock implementation para desenvolvimento local
      const activeProperties = mockProperties.filter(p => p.status === 'available');
      const featuredProperties = activeProperties.filter(p => p.featured);
      
      const typeStats = activeProperties.reduce((acc, prop) => {
        acc[prop.property_type] = (acc[prop.property_type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalProperties: activeProperties.length,
        featuredProperties: featuredProperties.length,
        types: {
          casa: typeStats.casa || 0,
          apartamento: typeStats.apartamento || 0,
          terreno: typeStats.terreno || 0
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Property();