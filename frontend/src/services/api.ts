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

export default api;
