const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Simular banco de tokens (em produção real, usar banco de dados)
const activeTokens = new Map();

// Inicializar com alguns tokens de exemplo
const initializeDefaultTokens = () => {
  const defaultTokens = [
    {
      tokenId: 'swift-app-001',
      name: 'Swift App Token',
      permissions: ['gemini'],
      createdBy: 'system',
      active: true
    },
    {
      tokenId: 'mobile-app-002', 
      name: 'Mobile App Token',
      permissions: ['gemini'],
      createdBy: 'system',
      active: true
    }
  ];

  defaultTokens.forEach(token => {
    activeTokens.set(token.tokenId, {
      ...token,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0
    });
  });

  logger.info('Default API tokens initialized', { count: defaultTokens.length });
};

// Inicializar tokens padrão
initializeDefaultTokens();

const generateApiToken = (req, res) => {
  try {
    const { name, permissions = ['gemini'], expiresIn = '365d' } = req.body;
    
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome do token é obrigatório (mínimo 3 caracteres)'
      });
    }

    // Gerar token único
    const tokenId = crypto.randomBytes(16).toString('hex');
    const apiToken = jwt.sign(
      {
        tokenId,
        type: 'api_token',
        name: name.trim(),
        permissions,
        createdBy: req.user.username,
        createdAt: new Date().toISOString()
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Salvar token ativo
    activeTokens.set(tokenId, {
      name: name.trim(),
      permissions,
      createdBy: req.user.username,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0,
      active: true,
      expiresIn
    });

    logger.info('API token generated', {
      tokenId,
      name: name.trim(),
      createdBy: req.user.username,
      permissions
    });

    res.json({
      status: 'success',
      message: 'Token de API gerado com sucesso',
      data: {
        token: apiToken,
        tokenId,
        name: name.trim(),
        permissions,
        expiresIn,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error generating API token', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Erro ao gerar token de API',
      error: error.message
    });
  }
};

const listApiTokens = (req, res) => {
  try {
    const tokens = Array.from(activeTokens.entries()).map(([tokenId, data]) => ({
      tokenId,
      name: data.name,
      permissions: data.permissions,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      lastUsed: data.lastUsed,
      usageCount: data.usageCount,
      active: data.active,
      expiresIn: data.expiresIn
    }));

    res.json({
      status: 'success',
      message: 'Lista de tokens de API',
      data: tokens
    });
  } catch (error) {
    logger.error('Error listing tokens', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Erro ao listar tokens'
    });
  }
};

const revokeApiToken = (req, res) => {
  try {
    const { tokenId } = req.params;
    
    if (activeTokens.has(tokenId)) {
      const tokenData = activeTokens.get(tokenId);
      tokenData.active = false;
      
      logger.info('API token revoked', { 
        tokenId, 
        name: tokenData.name,
        revokedBy: req.user.username 
      });
      
      res.json({
        status: 'success',
        message: 'Token revogado com sucesso'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Token não encontrado'
      });
    }
  } catch (error) {
    logger.error('Error revoking token', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Erro ao revogar token'
    });
  }
};

const getTokenStats = (req, res) => {
  try {
    const stats = {
      total: activeTokens.size,
      active: Array.from(activeTokens.values()).filter(t => t.active).length,
      inactive: Array.from(activeTokens.values()).filter(t => !t.active).length,
      totalUsage: Array.from(activeTokens.values()).reduce((sum, t) => sum + t.usageCount, 0)
    };

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('Error getting token stats', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter estatísticas'
    });
  }
};

// Função para validar se um token é válido
const validateApiToken = (tokenId) => {
  if (!activeTokens.has(tokenId)) {
    return { valid: false, reason: 'Token não encontrado' };
  }

  const tokenData = activeTokens.get(tokenId);
  
  if (!tokenData.active) {
    return { valid: false, reason: 'Token inativo' };
  }

  return { valid: true, tokenData };
};

// Função para atualizar uso do token
const updateTokenUsage = (tokenId) => {
  if (activeTokens.has(tokenId)) {
    const tokenData = activeTokens.get(tokenId);
    tokenData.lastUsed = new Date();
    tokenData.usageCount += 1;
  }
};

module.exports = {
  generateApiToken,
  listApiTokens,
  revokeApiToken,
  getTokenStats,
  validateApiToken,
  updateTokenUsage,
  activeTokens
};
