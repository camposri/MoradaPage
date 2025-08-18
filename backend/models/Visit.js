// const supabase = require('../config/supabase');
// Mock data para desenvolvimento local
const mockVisits = [];
let nextVisitId = 1;

class Visit {
  constructor() {
    this.tableName = 'visits';
  }

  // Criar novo agendamento de visita
  async create(visitData) {
    try {
      // Mock implementation para desenvolvimento local
      const newVisit = {
        id: nextVisitId++,
        ...visitData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockVisits.push(newVisit);
      return newVisit;
    } catch (error) {
      throw error;
    }
  }

  // Buscar todas as visitas (para admin)
  async findAll(filters = {}) {
    try {
      // Mock implementation para desenvolvimento local
      let filteredVisits = [...mockVisits];
      
      // Filtrar por status
      if (filters.status) {
        filteredVisits = filteredVisits.filter(v => v.status === filters.status);
      }

      // Filtrar por data
      if (filters.date) {
        filteredVisits = filteredVisits.filter(v => v.preferred_date === filters.date);
      }

      if (filters.startDate) {
        filteredVisits = filteredVisits.filter(v => v.preferred_date >= filters.startDate);
      }

      if (filters.endDate) {
        filteredVisits = filteredVisits.filter(v => v.preferred_date <= filters.endDate);
      }

      // Filtrar por propriedade
      if (filters.propertyId) {
        filteredVisits = filteredVisits.filter(v => v.property_id == filters.propertyId);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      const paginatedVisits = filteredVisits.slice(offset, offset + limit);

      return {
        visits: paginatedVisits,
        pagination: {
          page,
          limit,
          total: filteredVisits.length,
          totalPages: Math.ceil(filteredVisits.length / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Buscar visita por ID
  async findById(id) {
    try {
      // Mock implementation para desenvolvimento local
      const visit = mockVisits.find(v => v.id == id);
      if (!visit) {
        throw new Error('Visita não encontrada');
      }
      return visit;
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
      // Mock implementation para desenvolvimento local
      const visitIndex = mockVisits.findIndex(v => v.id == id);
      if (visitIndex === -1) {
        throw new Error('Visita não encontrada');
      }
      
      mockVisits[visitIndex].status = status;
      mockVisits[visitIndex].updated_at = new Date().toISOString();
      
      if (notes) {
        mockVisits[visitIndex].admin_notes = notes;
      }

      if (status === 'confirmed') {
        mockVisits[visitIndex].confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        mockVisits[visitIndex].completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        mockVisits[visitIndex].cancelled_at = new Date().toISOString();
      }
      
      return mockVisits[visitIndex];
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
      // Mock implementation para desenvolvimento local
      let conflictingVisits = mockVisits.filter(v => 
        v.preferred_date === date && 
        v.preferred_time === time && 
        ['pending', 'confirmed', 'rescheduled'].includes(v.status)
      );

      if (excludeId) {
        conflictingVisits = conflictingVisits.filter(v => v.id != excludeId);
      }

      return conflictingVisits.length === 0; // true se disponível
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