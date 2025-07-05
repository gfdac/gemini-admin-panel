const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// PROMPT PARA COPILOT: Gerar middleware de autenticação JWT aqui
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Access attempt without token', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({
      status: 'error',
      message: 'Access token required'
    });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
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

    req.user = user;
    logger.info('User authenticated successfully', { 
      userId: user.id, 
      username: user.username 
    });
    next();
  });
};

module.exports = {
  authenticateToken
};
