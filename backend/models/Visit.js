const supabase = require('../config/supabase');

class Visit {
  constructor() {
    this.tableName = 'visits';
  }

  // Criar novo agendamento de visita
  async create(visitData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...visitData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type,
            price
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar todas as visitas (para admin)
  async findAll(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type,
            price,
            images
          )
        `);

      // Filtrar por status
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Filtrar por data
      if (filters.date) {
        query = query.eq('preferred_date', filters.date);
      }

      if (filters.startDate) {
        query = query.gte('preferred_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('preferred_date', filters.endDate);
      }

      // Filtrar por propriedade
      if (filters.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Ordenação
      query = query.order('preferred_date', { ascending: true })
                   .order('preferred_time', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        visits: data,
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

  // Buscar visita por ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type,
            price,
            images,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar visitas por email do cliente
  async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type,
            price,
            images
          )
        `)
        .eq('email', email)
        .order('preferred_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar status da visita
  async updateStatus(id, status, notes = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type,
            price
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Reagendar visita
  async reschedule(id, newDate, newTime, reason = null) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          preferred_date: newDate,
          preferred_time: newTime,
          status: 'rescheduled',
          reschedule_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type,
            price
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verificar disponibilidade de horário
  async checkAvailability(date, time, excludeId = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('id')
        .eq('preferred_date', date)
        .eq('preferred_time', time)
        .in('status', ['pending', 'confirmed', 'rescheduled']);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.length === 0; // true se disponível
    } catch (error) {
      throw error;
    }
  }

  // Obter visitas do dia
  async getTodayVisits() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          properties (
            id,
            title,
            address,
            city,
            type
          )
        `)
        .eq('preferred_date', today)
        .in('status', ['pending', 'confirmed', 'rescheduled'])
        .order('preferred_time', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Obter estatísticas de visitas
  async getStats() {
    try {
      const { count: totalVisits } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      const { count: pendingVisits } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: confirmedVisits } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      const { count: completedVisits } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Visitas dos próximos 7 dias
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { count: upcomingVisits } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .gte('preferred_date', new Date().toISOString().split('T')[0])
        .lte('preferred_date', nextWeek.toISOString().split('T')[0])
        .in('status', ['pending', 'confirmed', 'rescheduled']);

      return {
        totalVisits,
        pendingVisits,
        confirmedVisits,
        completedVisits,
        upcomingVisits
      };
    } catch (error) {
      throw error;
    }
  }

  // Deletar visita
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

module.exports = new Visit();