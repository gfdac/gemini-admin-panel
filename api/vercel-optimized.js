const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuração básica de logging para Vercel
const logger = {
  info: (msg, meta) => console.log(`INFO: ${msg}`, meta ? JSON.stringify(meta) : ''),
  error: (msg, meta) => console.error(`ERROR: ${msg}`, meta ? JSON.stringify(meta) : ''),
  warn: (msg, meta) => console.warn(`WARN: ${msg}`, meta ? JSON.stringify(meta) : ''),
  debug: (msg, meta) => console.log(`DEBUG: ${msg}`, meta ? JSON.stringify(meta) : '')
};

// Middleware de autenticação simplificado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token de acesso requerido'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed', { error: error.message });
    return res.status(403).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
};

// Controller do chat simplificado e robusto
const chatController = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt, message } = req.body;
    const finalPrompt = prompt || message;
    const userId = req.user?.id || 'anonymous';
    const username = req.user?.username || 'Anonymous User';

    // Validação básica
    if (!finalPrompt || typeof finalPrompt !== 'string' || finalPrompt.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt é obrigatório e deve ser uma string não vazia'
      });
    }

    // Verificar se o Gemini API key está configurado
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      logger.error('Gemini API Key not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Serviço temporariamente indisponível - API key não configurada'
      });
    }

    logger.info('Processing Gemini request', {
      userId,
      username,
      promptLength: finalPrompt.length
    });

    // Inicializar Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Fazer a requisição para o Gemini
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const geminiResponse = response.text();

    const processingTime = Date.now() - startTime;

    logger.info('Gemini request completed', {
      userId,
      username,
      processingTime,
      responseLength: geminiResponse.length
    });

    // Resposta de sucesso
    return res.json({
      status: 'success',
      message: 'Resposta gerada com sucesso',
      data: {
        originalPrompt: finalPrompt,
        geminiResponse: geminiResponse,
        metadata: {
          model: 'gemini-1.5-flash',
          candidateCount: 1,
          finishReason: 'STOP',
          processingTime: processingTime,
          userId: userId,
          username: username,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('Gemini request failed', {
      error: error.message,
      stack: error.stack,
      processingTime
    });

    // Verificar se é erro de API key inválida
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      return res.status(500).json({
        status: 'error',
        message: 'Configuração de API inválida'
      });
    }

    // Verificar se é erro de quota
    if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({
        status: 'error',
        message: 'Cota da API excedida. Tente novamente mais tarde.'
      });
    }

    // Erro genérico
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor. Tente novamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Endpoint de teste simples
const healthCheck = (req, res) => {
  return res.json({
    status: 'success',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  chatController,
  authenticateToken,
  healthCheck
};
