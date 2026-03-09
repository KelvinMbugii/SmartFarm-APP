import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class OfficerService {

  async getDashboardSummary() {
    const response = await api.get(`${API_BASE_URL}/api/officers/me/dashboard-summary`);
    return response.data;
  }

  async getMyAvailability() {
    const response = await api.get(`${API_BASE_URL}/api/officers/me/availability`);
    return response.data;
  }

  async updateMyAvailability(payload) {
    const response = await api.put(`${API_BASE_URL}/api/officers/me/availability`, payload);
    return response.data;
  }

  async getOfficerSlots(officerId, date) {
    const response = await api.get(`${API_BASE_URL}/api/officers/${officerId}/slots`, {
      params: { date },
    });
    return response.data;
  }
}

export default new OfficerService();