const supabase = require('../config/supabase');

class Contact {
  constructor() {
    this.tableName = 'contacts';
  }

  // Criar novo contato
  async create(contactData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...contactData,
          status: 'new',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar todos os contatos (para admin)
  async findAll(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*');

      // Filtrar por status
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Filtrar por data
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Ordenação
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        contacts: data,
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

  // Buscar contato por ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar status do contato
  async updateStatus(id, status, notes = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Marcar como lido
  async markAsRead(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
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

  // Obter estatísticas de contatos
  async getStats() {
    try {
      const { count: totalContacts } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      const { count: newContacts } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      const { count: readContacts } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'read');

      const { count: respondedContacts } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'responded');

      // Contatos dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentContacts } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        totalContacts,
        newContacts,
        readContacts,
        respondedContacts,
        recentContacts
      };
    } catch (error) {
      throw error;
    }
  }

  // Deletar contato
  async delete(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Contact();