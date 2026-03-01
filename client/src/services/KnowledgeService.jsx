import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class KnowledgeService {
  async getArticles(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/api/knowledge`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  async getArticle(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/api/knowledge/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  }

  async createArticle(articleData) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/knowledge`, articleData);
      return response.data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  async updateArticle(id, articleData) {
    try {
      const response = await api.put(`${API_BASE_URL}/api/knowledge/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  async deleteArticle(id) {
    try {
      const response = await api.delete(`${API_BASE_URL}/api/knowledge/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  async likeArticle(id) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/knowledge/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking article:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await api.get(`${API_BASE_URL}/api/knowledge/meta/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export default new KnowledgeService();

