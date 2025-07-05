/*
PROMPT PARA COPILOT:

# Projeto de API Segura com Gemini e Frontend Moderno (Node.js + React.js)

## Objetivo Geral:
Desenvolver uma API Node.js segura para interagir com a API Gemini e um frontend React.js moderno para gerenciamento, incluindo autenticação com JWT e logging robusto.

## Backend (Node.js com Express):
- **Configuração Inicial:** Configurar um servidor Express.js básico.
- **Variáveis de Ambiente:** Usar `dotenv` para carregar `PORT`, `JWT_SECRET` e `GEMINI_API_KEY` do arquivo `.env`.
- **Logging:** Implementar um logger com Winston para registrar informações, erros e avisos em console e arquivos (`error.log`, `combined.log`).
- **Autenticação (JWT):**
    - Criar um endpoint `/api/login` que aceita `username` e `password`.
    - Se as credenciais (simuladas por enquanto) forem válidas, gerar e retornar um **JWT**.
    - Criar um middleware `authenticateToken` para validar o JWT em rotas protegidas, anexando as informações do usuário (`req.user`).
- **Validação de Requisições (Joi):**
    - Criar um middleware `validateLoginRequest` para validar os campos de login.
    - Criar um middleware `validateGeminiRequest` para validar o `prompt` da requisição Gemini (mínimo 3 caracteres, obrigatório).
- **Serviço Gemini:**
    - Criar uma função `callGeminiAPI` em `services/geminiService.js` que usa `axios` (ou o SDK oficial) para chamar a API do Gemini.
    - Deve receber um `prompt` como entrada.
    - Tratar erros da API Gemini e logar detalhes.
    - Retornar a resposta do Gemini em formato de texto.
- **Controller Gemini:**
    - Criar um controller `processGeminiRequest` que orquestra a chamada ao serviço Gemini e retorna a resposta formatada (`status`, `data`, `originalPrompt`, `geminiResponse`, `timestamp`).
    - Lidar com erros internos e logá-los.
- **Rotas:**
    - Definir rotas no `routes/index.js`.
    - `/api/login` (POST): Rota de login, pública, com validação.
    - `/api/gemini` (POST): Rota principal para interação com Gemini, **protegida por JWT** e com validação de `prompt`.
    - `/api/protected` (GET): Rota simples para testar autenticação.
- **Middleware CORS:** Habilitar CORS para permitir requisições do frontend.
- **Tratamento de Erros Global:** Adicionar um middleware final para capturar e logar erros não tratados.

Comece a gerar o código para `backend/src/app.js` e as configurações iniciais.
*/

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { config } = require('./config/env');
const logger = require('./utils/logger');
const routes = require('./routes');
const { initializeDefaultUsers } = require('./controllers/authController');

// Import Redis conditionally to avoid errors if not available
let redisService = null;
try {
  redisService = require('./config/redis');
} catch (error) {
  logger.warn('Redis module not available, will continue without Redis:', error.message);
}

const app = express();

// Trust proxy setting for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true, // Trust proxy headers
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Security middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Initialize Redis connection and default users
const initializeApp = async () => {
  try {
    // Connect to Redis if available
    if (redisService) {
      await redisService.connect();
      logger.info('Redis connection established');

      // Initialize default users
      await initializeDefaultUsers();
      logger.info('Default users initialized');
    } else {
      logger.warn('Redis not available, skipping Redis initialization');
    }

  } catch (error) {
    logger.error('Failed to initialize app', {
      error: error.message,
      stack: error.stack
    });
    
    // Don't exit in development for easier debugging
    if (config.nodeEnv === 'production') {
      logger.error('Production mode: exiting due to initialization failure');
      process.exit(1);
    } else {
      logger.warn('Continuing without Redis in development mode');
    }
  }
};

// Call initialization
initializeApp();

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Global error handler: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
