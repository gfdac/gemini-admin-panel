const express = require('express');
const { authenticateToken, requirePermission, requireRole } = require('../middlewares/auth');
const { validateLoginRequest, validateGeminiRequest } = require('../middlewares/validation');
const { login, getProtectedData } = require('../controllers/authController');
const { processGeminiRequest, getGeminiStats } = require('../controllers/geminiController');
const { 
  generateApiToken, 
  listApiTokens, 
  revokeApiToken, 
  getTokenStats 
} = require('../controllers/tokenController');
const {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserDetails,
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  getApiKeyDetails,
  getRequestsHistory,
  getSystemStats
} = require('../controllers/adminController');
const logger = require('../utils/logger');

const router = express.Router();

// PROMPT PARA COPILOT: Definir rotas no routes/index.js
// /api/login (POST): Rota de login, pública, com validação
// /api/gemini (POST): Rota principal para interação com Gemini, protegida por JWT e com validação de prompt
// /api/protected (GET): Rota simples para testar autenticação

// Public routes
router.post('/login', validateLoginRequest, login);

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below this middleware require authentication

// Test protected route
router.get('/protected', getProtectedData);

// Gemini routes
router.post('/gemini', requirePermission('gemini'), validateGeminiRequest, processGeminiRequest);
router.get('/gemini/stats', getGeminiStats);

// API Token Management Routes (Admin only)
router.post('/tokens', (req, res, next) => {
  // Only allow user tokens to create API tokens
  if (req.user.type !== 'user_token') {
    return res.status(403).json({
      status: 'error',
      message: 'Apenas usuários podem criar tokens de API'
    });
  }
  next();
}, generateApiToken);

router.get('/tokens', (req, res, next) => {
  if (req.user.type !== 'user_token') {
    return res.status(403).json({
      status: 'error',
      message: 'Apenas usuários podem listar tokens'
    });
  }
  next();
}, listApiTokens);

router.delete('/tokens/:tokenId', (req, res, next) => {
  if (req.user.type !== 'user_token') {
    return res.status(403).json({
      status: 'error', 
      message: 'Apenas usuários podem revogar tokens'
    });
  }
  next();
}, revokeApiToken);

router.get('/tokens/stats', (req, res, next) => {
  if (req.user.type !== 'user_token') {
    return res.status(403).json({
      status: 'error',
      message: 'Apenas usuários podem ver estatísticas'
    });
  }
  next();
}, getTokenStats);

// Admin routes (require admin role)
router.get('/admin/dashboard', requireRole('admin'), getDashboardStats);

// User management routes
router.get('/admin/users', requireRole('admin'), getUsers);
router.post('/admin/users', requireRole('admin'), createUser);
router.get('/admin/users/:userId', requireRole('admin'), getUserDetails);
router.put('/admin/users/:userId', requireRole('admin'), updateUser);
router.delete('/admin/users/:userId', requireRole('admin'), deleteUser);

// API Key management routes
router.get('/admin/keys', requireRole('admin'), getApiKeys);
router.post('/admin/keys', requireRole('admin'), createApiKey);
router.get('/admin/keys/:keyId', requireRole('admin'), getApiKeyDetails);
router.put('/admin/keys/:keyId', requireRole('admin'), updateApiKey);
router.delete('/admin/keys/:keyId', requireRole('admin'), deleteApiKey);

// Request history and monitoring
router.get('/admin/requests', requireRole('admin'), getRequestsHistory);
router.get('/admin/stats', requireRole('admin'), getSystemStats);

// API documentation route
router.get('/docs', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Documentation',
    endpoints: {
      public: {
        'POST /api/login': 'User authentication',
        'GET /api/health': 'API health check'
      },
      protected: {
        'GET /api/protected': 'Test protected route',
        'POST /api/gemini': 'Generate content with Gemini AI',
        'GET /api/gemini/stats': 'Get user Gemini usage statistics',
        'GET /api/docs': 'This documentation'
      },
      admin: {
        'POST /api/tokens': 'Generate a new API token',
        'GET /api/tokens': 'List all API tokens',
        'DELETE /api/tokens/:tokenId': 'Revoke an API token',
        'GET /api/tokens/stats': 'Get statistics of API token usage'
      }
    },
    authentication: {
      type: 'Bearer JWT',
      header: 'Authorization: Bearer <token>',
      login: {
        url: '/api/login',
        method: 'POST',
        body: {
          username: 'string',
          password: 'string'
        }
      }
    },
    examples: {
      login: {
        username: 'admin',
        password: 'admin123'
      },
      gemini: {
        prompt: 'Write a short poem about artificial intelligence',
        temperature: 0.7,
        maxOutputTokens: 1000
      },
      token: {
        name: 'New API Token',
        permissions: ['read:data', 'write:data']
      }
    }
  });
});

// Catch all unmatched routes within /api
router.use('*', (req, res) => {
  logger.warn('API route not found', { 
    path: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  });
  
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: '/api/docs'
  });
});

module.exports = router;
