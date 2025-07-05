import axios, { AxiosResponse, AxiosError } from 'axios';

// PROMPT PARA COPILOT: Criar serviço de API com axios configurado para a URL da API Node.js 
// e interceptor para adicionar JWT nas requisições

// Configuração de URL baseada no ambiente
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // No Vercel, a API fica em /api
  : process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      role: string;
    };
    expiresIn: string;
  };
}

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  status: string;
  message: string;
  data: {
    originalPrompt: string;
    geminiResponse: string;
    metadata: {
      model: string;
      candidateCount: number;
      finishReason: string;
      processingTime: number;
      userId: number;
      username: string;
      timestamp: string;
    };
  };
}

export interface ApiError {
  status: string;
  message: string;
  details?: string;
}

// API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  testProtected: async (): Promise<any> => {
    const response = await api.get('/protected');
    return response.data;
  },
};

export const geminiApi = {
  generateContent: async (request: GeminiRequest): Promise<GeminiResponse> => {
    const response = await api.post<GeminiResponse>('/gemini', request);
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get('/gemini/stats');
    return response.data;
  },
};

export const healthApi = {
  check: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Admin API functions
export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<any> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users management
  getUsers: async (): Promise<any> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUserStats: async (userId: string): Promise<any> => {
    const response = await api.get(`/admin/users/${userId}/stats`);
    return response.data;
  },

  createUser: async (userData: any): Promise<any> => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: any): Promise<any> => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<any> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId: string): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // API Keys management
  getApiKeys: async (): Promise<any> => {
    const response = await api.get('/admin/keys');
    return response.data;
  },

  createApiKey: async (keyData: any): Promise<any> => {
    const response = await api.post('/admin/keys', keyData);
    return response.data;
  },

  updateApiKey: async (keyId: string, keyData: any): Promise<any> => {
    const response = await api.put(`/admin/keys/${keyId}`, keyData);
    return response.data;
  },

  deleteApiKey: async (keyId: string): Promise<any> => {
    const response = await api.delete(`/admin/keys/${keyId}`);
    return response.data;
  },

  rotateApiKey: async (keyId: string): Promise<any> => {
    const response = await api.post(`/admin/keys/${keyId}/rotate`);
    return response.data;
  },

  toggleApiKeyStatus: async (keyId: string): Promise<any> => {
    const response = await api.post(`/admin/keys/${keyId}/toggle-status`);
    return response.data;
  },

  getApiKeyStats: async (keyId: string): Promise<any> => {
    const response = await api.get(`/admin/keys/${keyId}/stats`);
    return response.data;
  },

  // Requests history
  getRequests: async (params?: any): Promise<any> => {
    const response = await api.get('/admin/requests', { params });
    return response.data;
  },

  deleteRequest: async (requestId: string): Promise<any> => {
    const response = await api.delete(`/admin/requests/${requestId}`);
    return response.data;
  },

  // System settings
  getSettings: async (): Promise<any> => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings: any): Promise<any> => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Stats and monitoring
  getStats: async (): Promise<any> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getSystemHealth: async (): Promise<any> => {
    const response = await api.get('/admin/health');
    return response.data;
  },

  // Real-time monitoring
  getRealtimeStats: async (): Promise<any> => {
    const response = await api.get('/admin/realtime');
    return response.data;
  }
};

export default api;
