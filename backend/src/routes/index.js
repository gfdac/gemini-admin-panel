const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { validateLoginRequest, validateGeminiRequest } = require('../middlewares/validation');
const { login, getProtectedData } = require('../controllers/authController');
const { processGeminiRequest, getGeminiStats } = require('../controllers/geminiController');
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
router.post('/gemini', validateGeminiRequest, processGeminiRequest);
router.get('/gemini/stats', getGeminiStats);

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
