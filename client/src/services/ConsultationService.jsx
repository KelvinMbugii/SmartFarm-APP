import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ConsultationService {
  async getConsultations() {
    try {
      const response = await api.get(`${API_BASE_URL}/api/consultation`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  }

  async getConsultation(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/api/consultation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      throw error;
    }
  }

  async createConsultation(consultationData) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/consultation`, consultationData);
      return response.data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  }

  async updateConsultation(id, consultationData) {
    try {
      const response = await api.put(`${API_BASE_URL}/api/consultation/${id}`, consultationData);
      return response.data;
    } catch (error) {
      console.error('Error updating consultation:', error);
      throw error;
    }
  }

  async addMessage(id, content) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/consultation/${id}/message`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  async submitFeedback(id, rating, feedback) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/consultation/${id}/feedback`, {
        rating,
        feedback
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getAvailableOfficers() {
    try {
      const response = await api.get(`${API_BASE_URL}/api/consultation/officers/available`);
      return response.data;
    } catch (error) {
      console.error('Error fetching officers:', error);
      throw error;
    }
  }
}

export default new ConsultationService();

