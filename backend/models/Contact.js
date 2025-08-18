// const supabase = require('../config/supabase');
// Mock data para desenvolvimento local
const mockContacts = [];
let nextContactId = 1;

class Contact {
  constructor() {
    this.tableName = 'contacts';
  }

  // Criar novo contato
  async create(contactData) {
    try {
      // Mock implementation para desenvolvimento local
      const newContact = {
        id: nextContactId++,
        ...contactData,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockContacts.push(newContact);
      return newContact;
    } catch (error) {
      throw error;
    }
  }

  // Buscar todos os contatos (para admin)
  async findAll(filters = {}) {
    try {
      // Mock implementation para desenvolvimento local
      let filteredContacts = [...mockContacts];
      
      // Filtrar por status
      if (filters.status) {
        filteredContacts = filteredContacts.filter(c => c.status === filters.status);
      }

      // Filtrar por data
      if (filters.startDate) {
        filteredContacts = filteredContacts.filter(c => c.created_at >= filters.startDate);
      }

      if (filters.endDate) {
        filteredContacts = filteredContacts.filter(c => c.created_at <= filters.endDate);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      const paginatedContacts = filteredContacts.slice(offset, offset + limit);

      return {
        contacts: paginatedContacts,
        pagination: {
          page,
          limit,
          total: filteredContacts.length,
          totalPages: Math.ceil(filteredContacts.length / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Buscar contato por ID
  async findById(id) {
    try {
      // Mock implementation para desenvolvimento local
      const contact = mockContacts.find(c => c.id == id);
      if (!contact) {
        throw new Error('Contato não encontrado');
      }
      return contact;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar status do contato
  async updateStatus(id, status, notes = null) {
    try {
      // Mock implementation para desenvolvimento local
      const contactIndex = mockContacts.findIndex(c => c.id == id);
      if (contactIndex === -1) {
        throw new Error('Contato não encontrado');
      }
      
      mockContacts[contactIndex].status = status;
      mockContacts[contactIndex].updated_at = new Date().toISOString();
      
      if (notes) {
        mockContacts[contactIndex].admin_notes = notes;
      }
      
      return mockContacts[contactIndex];
    } catch (error) {
      throw error;
    }
  }

  // Marcar como lido
  async markAsRead(id) {
    try {
      // Mock implementation para desenvolvimento local
      const contactIndex = mockContacts.findIndex(c => c.id == id);
      if (contactIndex === -1) {
        throw new Error('Contato não encontrado');
      }
      
      mockContacts[contactIndex].status = 'read';
      mockContacts[contactIndex].read_at = new Date().toISOString();
      mockContacts[contactIndex].updated_at = new Date().toISOString();
      
      return mockContacts[contactIndex];
    } catch (error) {
      throw error;
    }
  }

  // Obter estatísticas de contatos
  async getStats() {
    try {
      // Mock implementation para desenvolvimento local
      const totalContacts = mockContacts.length;
      const newContacts = mockContacts.filter(c => c.status === 'new').length;
      const readContacts = mockContacts.filter(c => c.status === 'read').length;
      const respondedContacts = mockContacts.filter(c => c.status === 'responded').length;

      // Contatos dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentContacts = mockContacts.filter(c => 
        new Date(c.created_at) >= thirtyDaysAgo
      ).length;

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
      // Mock implementation para desenvolvimento local
      const contactIndex = mockContacts.findIndex(c => c.id == id);
      if (contactIndex === -1) {
        throw new Error('Contato não encontrado');
      }
      
      const deletedContact = mockContacts.splice(contactIndex, 1)[0];
      return deletedContact;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Contact();