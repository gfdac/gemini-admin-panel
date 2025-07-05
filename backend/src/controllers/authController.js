const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// PROMPT PARA COPILOT: Criar controller de autenticação com login simulado

// Simulated users database (in production, use a real database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$8yJZK9X8X8X8X8X8X8X8XuK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', // password: admin123
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: '$2b$10$9yJZK9X8X8X8X8X8X8X8XuK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', // password: user123
    role: 'user'
  }
];

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    logger.info('Login attempt', { username, ip: req.ip });

    // Find user by username
    const user = users.find(u => u.username === username);

    if (!user) {
      logger.warn('Login failed - user not found', { username, ip: req.ip });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // For demo purposes, we'll use simple password comparison
    // In production, use bcrypt.compare(password, user.password)
    let isValidPassword = false;
    
    if (username === 'admin' && password === 'admin123') {
      isValidPassword = true;
    } else if (username === 'user' && password === 'user123') {
      isValidPassword = true;
    }

    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { username, ip: req.ip });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      config.jwtSecret,
      { 
        expiresIn: '24h',
        issuer: 'gemini-api',
        audience: 'gemini-client'
      }
    );

    logger.info('Login successful', { 
      userId: user.id, 
      username: user.username, 
      ip: req.ip 
    });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        expiresIn: '24h'
      }
    });

  } catch (error) {
    logger.error('Login error', { 
      error: error.message, 
      stack: error.stack,
      ip: req.ip 
    });

    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
  }
};

// Test protected route
const getProtectedData = (req, res) => {
  logger.info('Protected route accessed', { 
    userId: req.user.id, 
    username: req.user.username 
  });

  res.json({
    status: 'success',
    message: 'Access to protected route successful',
    data: {
      user: req.user,
      timestamp: new Date().toISOString(),
      message: 'This is protected data!'
    }
  });
};

module.exports = {
  login,
  getProtectedData
};
