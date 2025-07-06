const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const app = express();

// Configuração básica
const JWT_SECRET = process.env.JWT_SECRET || 'gemini_api_secret_key_2024';

// Dados simulados para produção (em uma aplicação real, use banco de dados)
const USERS = {
  admin: {
    id: 1,
    username: 'admin',
    password: '$2a$10$c6tTc/nFL7ohsqruzpAxL.zGT5rQEW3u/mJibPulVhr/YQTbXuVE6', // admin123
    role: 'admin',
    permissions: ['admin', 'gemini', 'tokens'],
    active: true
  },
  user: {
    id: 2,
    username: 'user',
    password: '$2a$10$yJmHXuhHHTZWrXzNOjnXEuT/r3asCWzjMS8k9x5vAqFMlxJo7RwHW', // user123
    role: 'user',
    permissions: ['gemini'],
    active: true
  }
};

const API_KEYS = new Map();
const REQUESTS_HISTORY = [];

// Middlewares básicos
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - Header:', authHeader ? 'Bearer ***' : 'None');
  console.log('Auth middleware - Token present:', !!token);

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({
      status: 'error',
      message: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth middleware - Token verification failed:', err.message);
      return res.status(403).json({
        status: 'error',
        message: 'Token inválido'
      });
    }
    console.log('Auth middleware - User authenticated:', user.username, user.role);
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        status: 'error',
        message: 'Permissão insuficiente'
      });
    }
    next();
  };
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gemini funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gemini funcionando',
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username e password são obrigatórios'
      });
    }

    const user = USERS[username];
    if (!user || !user.active) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas'
      });
    }

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        permissions: user.permissions,
        type: 'user_token'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions
        },
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// Chat/Gemini
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { prompt, temperature = 0.7, maxOutputTokens = 1000 } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt é obrigatório e deve ser uma string não vazia'
      });
    }

    // Simular resposta do Gemini (em produção, use a API real)
    const response = `Resposta simulada para: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\nEsta é uma resposta simulada da API Gemini. Em produção, aqui seria feita a chamada real para a API do Google Gemini.`;

    // Registrar request
    REQUESTS_HISTORY.push({
      id: Date.now(),
      userId: req.user.id,
      prompt: prompt.slice(0, 100),
      response: response.slice(0, 100),
      timestamp: new Date().toISOString(),
      success: true,
      tokensUsed: Math.floor(Math.random() * 500) + 100
    });

    res.json({
      status: 'success',
      message: 'Conteúdo gerado com sucesso',
      data: {
        response,
        metadata: {
          temperature,
          maxOutputTokens,
          tokensUsed: Math.floor(Math.random() * 500) + 100,
          model: 'gemini-pro'
        }
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    REQUESTS_HISTORY.push({
      id: Date.now(),
      userId: req.user.id,
      prompt: req.body.prompt?.slice(0, 100),
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false
    });

    res.status(500).json({
      status: 'error',
      message: 'Erro ao processar solicitação'
    });
  }
});

// Admin Dashboard
app.get('/api/admin/dashboard', authenticateToken, requireRole('admin'), (req, res) => {
  const usersData = Object.values(USERS);
  const apiKeysArray = Array.from(API_KEYS.values());
  
  const stats = {
    totalUsers: usersData.length,
    activeUsers: usersData.filter(u => u.active).length,
    totalRequests: REQUESTS_HISTORY.length,
    totalTokensUsed: REQUESTS_HISTORY.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
    averageResponseTime: 250, // simulado
    successRate: REQUESTS_HISTORY.length > 0 ? 
      Math.round((REQUESTS_HISTORY.filter(r => r.success).length / REQUESTS_HISTORY.length) * 100) : 0,
    apiKeysCount: apiKeysArray.length,
    activeApiKeys: apiKeysArray.filter(k => k.active).length,
    lastUpdated: new Date().toISOString()
  };

  res.json({
    status: 'success',
    message: 'Estatísticas do dashboard',
    data: stats
  });
});

// Users Management
app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  const users = Object.values(USERS).map(user => ({
    id: user.id.toString(),
    username: user.username,
    email: `${user.username}@example.com`,
    role: user.role,
    status: user.active ? 'active' : 'inactive',
    permissions: user.permissions,
    active: user.active,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    totalRequests: Math.floor(Math.random() * 1000) + 100,
    tokensUsed: Math.floor(Math.random() * 10000) + 1000,
    plan: user.role === 'admin' ? 'enterprise' : 'free',
    apiLimit: user.role === 'admin' ? 10000 : 1000,
    apiUsed: Math.floor(Math.random() * 800) + 100
  }));

  res.json({
    status: 'success',
    message: 'Lista de usuários',
    data: users
  });
});

app.post('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  const { username, password, role = 'user', permissions = [] } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Username e password são obrigatórios'
    });
  }

  if (USERS[username]) {
    return res.status(409).json({
      status: 'error',
      message: 'Usuário já existe'
    });
  }

  const newUser = {
    id: Object.keys(USERS).length + 1,
    username,
    password: bcryptjs.hashSync(password, 10),
    role,
    permissions,
    active: true
  };

  USERS[username] = newUser;

  res.status(201).json({
    status: 'success',
    message: 'Usuário criado com sucesso',
    data: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      permissions: newUser.permissions,
      active: newUser.active
    }
  });
});

// API Keys Management
app.get('/api/admin/keys', authenticateToken, requireRole('admin'), (req, res) => {
  const keys = Array.from(API_KEYS.values()).map(key => ({
    id: key.id,
    name: key.name,
    key: key.key.slice(0, 8) + '...',
    permissions: key.permissions,
    active: key.active,
    createdAt: key.createdAt,
    lastUsed: key.lastUsed
  }));

  res.json({
    status: 'success',
    message: 'Lista de chaves API',
    data: keys
  });
});

app.post('/api/admin/keys', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, permissions = [] } = req.body;

  if (!name) {
    return res.status(400).json({
      status: 'error',
      message: 'Nome da chave é obrigatório'
    });
  }

  const newKey = {
    id: API_KEYS.size + 1,
    name,
    key: 'gma_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    permissions,
    active: true,
    createdAt: new Date().toISOString(),
    lastUsed: null
  };

  API_KEYS.set(newKey.key, newKey);

  res.status(201).json({
    status: 'success',
    message: 'Chave API criada com sucesso',
    data: newKey
  });
});

// Requests History
app.get('/api/admin/requests', authenticateToken, requireRole('admin'), (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const requests = REQUESTS_HISTORY
    .slice(offset, offset + limit)
    .map(req => ({
      id: req.id,
      userId: req.userId,
      prompt: req.prompt,
      response: req.response || null,
      timestamp: req.timestamp,
      success: req.success,
      tokensUsed: req.tokensUsed || 0,
      error: req.error || null
    }));

  res.json({
    status: 'success',
    message: 'Histórico de requisições',
    data: {
      requests,
      pagination: {
        page,
        limit,
        total: REQUESTS_HISTORY.length,
        pages: Math.ceil(REQUESTS_HISTORY.length / limit)
      }
    }
  });
});

// System Stats
app.get('/api/admin/stats', authenticateToken, requireRole('admin'), (req, res) => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentRequests = REQUESTS_HISTORY.filter(r => new Date(r.timestamp) > last24h);
  
  const stats = {
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    },
    activity: {
      requestsLast24h: recentRequests.length,
      successfulLast24h: recentRequests.filter(r => r.success).length,
      failedLast24h: recentRequests.filter(r => !r.success).length,
      tokensUsedLast24h: recentRequests.reduce((sum, r) => sum + (r.tokensUsed || 0), 0)
    },
    performance: {
      avgResponseTime: 250,
      successRate: REQUESTS_HISTORY.length > 0 ? 
        Math.round((REQUESTS_HISTORY.filter(r => r.success).length / REQUESTS_HISTORY.length) * 100) : 0
    }
  };

  res.json({
    status: 'success',
    message: 'Estatísticas do sistema',
    data: stats
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    status: 'success',
    message: 'Documentação da API Gemini',
    version: '1.0.0',
    endpoints: {
      public: {
        'GET /api/health': 'Health check da API',
        'POST /api/login': 'Autenticação de usuário'
      },
      protected: {
        'POST /api/chat': 'Gerar conteúdo com Gemini AI'
      },
      admin: {
        'GET /api/admin/dashboard': 'Estatísticas do dashboard',
        'GET /api/admin/users': 'Listar usuários',
        'POST /api/admin/users': 'Criar usuário',
        'GET /api/admin/keys': 'Listar chaves API',
        'POST /api/admin/keys': 'Criar chave API',
        'GET /api/admin/requests': 'Histórico de requisições',
        'GET /api/admin/stats': 'Estatísticas do sistema'
      }
    },
    authentication: {
      type: 'Bearer JWT',
      header: 'Authorization: Bearer <token>'
    }
  });
});

// Rota de fallback
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    availableEndpoints: '/api/docs'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
});

module.exports = app;
