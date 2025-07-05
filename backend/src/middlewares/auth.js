const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// Importar funções do controller de tokens
let validateApiToken, updateTokenUsage;
try {
  const tokenController = require('../controllers/tokenController');
  validateApiToken = tokenController.validateApiToken;
  updateTokenUsage = tokenController.updateTokenUsage;
} catch (error) {
  // Fallback se o controller não existir ainda
  validateApiToken = () => ({ valid: false, reason: 'Token controller not available' });
  updateTokenUsage = () => {};
}

// PROMPT PARA COPILOT: Middleware de autenticação JWT com suporte a API tokens
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Access attempt without token', { 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Access token required',
        hint: 'Use: Authorization: Bearer YOUR_TOKEN'
      });
    }

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        logger.warn('Invalid token attempt', { 
          ip: req.ip, 
          path: req.path,
          error: err.message 
        });
        return res.status(403).json({
          status: 'error',
          message: 'Invalid or expired token'
        });
      }

      // Se é um API token
      if (decoded.type === 'api_token') {
        const validation = validateApiToken(decoded.tokenId);
        
        if (!validation.valid) {
          logger.warn('Invalid API token attempt', { 
            tokenId: decoded.tokenId, 
            reason: validation.reason,
            ip: req.ip 
          });
          
          return res.status(401).json({
            status: 'error',
            message: 'Token de API inválido',
            reason: validation.reason
          });
        }

        // Atualizar uso do token
        updateTokenUsage(decoded.tokenId);
        
        // Adicionar informações do token na requisição
        req.user = {
          id: decoded.tokenId,
          username: decoded.name,
          role: 'api_user',
          type: 'api_token',
          permissions: decoded.permissions,
          tokenId: decoded.tokenId
        };

        logger.info('API token authenticated', {
          tokenId: decoded.tokenId,
          name: decoded.name,
          ip: req.ip
        });

        return next();
      }
      
      // Se é um JWT de usuário normal
      else {
        req.user = {
          id: decoded.id || decoded.userId,
          username: decoded.username,
          role: decoded.role,
          type: 'user_token'
        };

        logger.info('User authenticated successfully', { 
          userId: req.user.id, 
          username: req.user.username 
        });
        
        return next();
      }
    });

  } catch (error) {
    logger.error('Authentication middleware error', { 
      error: error.message,
      ip: req.ip 
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno de autenticação'
    });
  }
};

// Middleware para verificar permissões específicas
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não autenticado'
      });
    }

    // Usuários normais têm todas as permissões
    if (req.user.type === 'user_token') {
      return next();
    }

    // API tokens precisam ter a permissão específica
    if (req.user.type === 'api_token') {
      if (!req.user.permissions || !req.user.permissions.includes(permission)) {
        return res.status(403).json({
          status: 'error',
          message: `Permissão '${permission}' necessária`,
          userPermissions: req.user.permissions
        });
      }
    }

    next();
  };
};

// PROMPT PARA COPILOT: Middleware requireRole para verificar permissões por role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (req.user.role !== requiredRole) {
        logger.warn('Role access denied', {
          userId: req.user.id,
          username: req.user.username,
          userRole: req.user.role,
          requiredRole,
          ip: req.ip,
          path: req.path
        });

        return res.status(403).json({
          status: 'error',
          message: `Access denied. Required role: ${requiredRole}`,
          data: {
            userRole: req.user.role,
            requiredRole
          }
        });
      }

      logger.debug('Role access granted', {
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        path: req.path
      });

      next();
    } catch (error) {
      logger.error('Role check error', {
        error: error.message,
        stack: error.stack,
        path: req.path
      });

      res.status(500).json({
        status: 'error',
        message: 'Role verification failed'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole
};
