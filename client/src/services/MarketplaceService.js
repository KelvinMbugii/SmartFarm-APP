import api from "./api";

const BASE = "/api/marketplace";

export const marketplaceApi = {
  getDashboardStats: () => api.get(`${BASE}/dashboard/stats`),

  getProducts: (params) => api.get(`${BASE}/products`, { params }),
  getProduct: (id) => api.get(`${BASE}/products/${id}`),
  createProduct: (data) => api.post(`${BASE}/products`, data),
  updateProduct: (id, data) => api.put(`${BASE}/products/${id}`, data),
  deleteProduct: (id) => api.delete(`${BASE}/products/${id}`),
  getMyProducts: () => api.get(`${BASE}/my-products`),

  placeOrder: (data) => api.post(`${BASE}/orders`, data),
  getMyOrders: (as = "buyer") => api.get(`${BASE}/orders`, { params: { as } }),
  getOrder: (id) => api.get(`${BASE}/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.patch(`${BASE}/orders/${id}/status`, { status }),
  initiatePayment: (orderId, confirmPayment = false) =>
    api.post(`${BASE}/orders/${orderId}/pay`, { confirmPayment }),
};

export const MARKETPLACE_CATEGORIES = [
  "seeds",
  "fertilizers",
  "farm_tools",
  "animal_feed",
  "farm_inputs",
  "maize",
  "vegetables",
  "fruits",
  "milk",
  "other",
];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

export default marketplaceApi;
