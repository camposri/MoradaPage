const supabase = require('../config/supabase');

class Property {
  constructor() {
    this.tableName = 'properties';
  }

  // Buscar propriedades com filtros
  async search(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active');

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms) {
        query = query.eq('bathrooms', filters.bathrooms);
      }

      if (filters.area) {
        query = query.gte('area', filters.area);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Ordenação
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        properties: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
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
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar propriedades em destaque
  async getFeatured(limit = 6) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar propriedades similares
  async getSimilar(propertyId, type, city, limit = 4) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .eq('type', type)
        .eq('city', city)
        .neq('id', propertyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Criar nova propriedade (para admin)
  async create(propertyData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...propertyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
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
        .from(this.tableName)
        .update({
          ...propertyData,
          updated_at: new Date().toISOString()
        })
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
        .from(this.tableName)
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
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
      const { count: totalProperties } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: featuredProperties } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('featured', true);

      return {
        totalProperties,
        featuredProperties
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Property();