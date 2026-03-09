import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ForumService {
  async getPosts(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/api/forum`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPost(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/api/forum/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  async createPost(postData) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum`, postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id, postData) {
    try {
      const response = await api.put(`${API_BASE_URL}/api/forum/${id}`, postData);
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id) {
    try {
      const response = await api.delete(`${API_BASE_URL}/api/forum/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async likePost(id) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async addComment(postId, content) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${postId}/comment`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async updateComment(postId, commentId, content) {
    try {
      const response = await api.put(`${API_BASE_URL}/api/forum/${postId}/comment/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(postId, commentId) {
    try {
      const response = await api.delete(`${API_BASE_URL}/api/forum/${postId}/comment/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async likeComment(postId, commentId) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${postId}/comment/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  async addReply(postId, commentId, content) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${postId}/comment/${commentId}/reply`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }


  async pinPost(id, pinned) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${id}/pin`, { pinned });
      return response.data;
    } catch (error) {
      console.error('Error pinning post:', error);
      throw error;
    }
  }

  async verifyComment(postId, commentId, verified) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${postId}/comment/${commentId}/verify`, { verified });
      return response.data;
    } catch (error) {
      console.error('Error verifying comment:', error);
      throw error;
    }
  }

  async reportPost(postId, reason, targetType = 'post', targetCommentId) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/forum/${postId}/report`, {
        reason,
        targetType,
        targetCommentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  async getReports(status = 'open') {
    try {
      const response = await api.get(`${API_BASE_URL}/api/forum/reports`, { params: { status } });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async resolveReport(reportId, note = '') {
    try {
      const response = await api.put(`${API_BASE_URL}/api/forum/reports/${reportId}/resolve`, { note });
      return response.data;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await api.get(`${API_BASE_URL}/api/forum/meta/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export default new ForumService();