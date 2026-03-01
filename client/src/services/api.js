import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true,
});

// Centralized request interceptor for auth + debug visibility
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDev) {
      const method = (config.method || "GET").toUpperCase();
      console.debug(`[API][REQ] ${method} ${config.baseURL}${config.url}`,{
        params: config.params,
        data: config.data,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized response interceptor for debug + auth failures
api.interceptors.response.use(
  (response) =>{
    if (isDev) {
       const method = (response.config.method || "GET").toUpperCase();
      console.debug(
        `[API][RES] ${response.status} ${method} ${response.config.baseURL}${response.config.url}`,
        response.data
      );
    }

    return response;
  },
  (error) => {
     if (isDev) {
       const method = (error.config?.method || "GET").toUpperCase();
       console.debug(
         `[API][ERR] ${error.response?.status || "NETWORK"} ${method} ${error.config?.baseURL || ""}${error.config?.url || ""}`,
         error.response?.data || error.message,
       );
     }

    if (error.response?.status === 401) {
      // Clear token and redirect or reload to trigger logout flow
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;
