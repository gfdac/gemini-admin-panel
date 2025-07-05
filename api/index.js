const express = require('express');
const cors = require('cors');
const { chatController, authenticateToken, healthCheck } = require('./vercel-optimized');

const app = express();

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

// Rotas
app.get('/api/health', healthCheck);
app.get('/api', healthCheck);

// Rota do chat (protegida)
app.post('/api/chat', authenticateToken, chatController);

// Rota de fallback
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /api/health',
      'POST /api/chat'
    ]
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
