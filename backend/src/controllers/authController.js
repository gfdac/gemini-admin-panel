const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../config/env');
const logger = require('../utils/logger');
const userService = require('../services/userService');
const redisService = require('../config/redis');

// PROMPT PARA COPILOT: Criar controller de autenticação real com Redis

// Initialize default users if they don't exist
const initializeDefaultUsers = async () => {
  try {
    // Check if admin user exists
    const adminUser = await userService.getUserByUsername('admin');
    if (!adminUser) {
      await userService.createUser({
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123',
        role: 'admin',
        plan: 'enterprise',
        permissions: ['admin:full', 'users:manage', 'keys:manage', 'system:config'],
        tags: ['admin', 'system']
      });
      logger.info('Default admin user created');
    }

    // Check if regular user exists
    const regularUser = await userService.getUserByUsername('user');
    if (!regularUser) {
      await userService.createUser({
        username: 'user',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        password: 'user123',
        role: 'user',
        plan: 'free',
        permissions: ['api:use'],
        tags: ['demo', 'basic']
      });
      logger.info('Default user created');
    }
  } catch (error) {
    logger.error('Error initializing default users', { error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    logger.info('Login attempt', { username, ip: req.ip });

    // Find user by username
    const user = await userService.getUserByUsername(username);

    if (!user) {
      logger.warn('Login failed - user not found', { username, ip: req.ip });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      logger.warn('Login failed - user not active', { username, status: user.status, ip: req.ip });
      return res.status(401).json({
        status: 'error',
        message: 'Account is not active'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { username, ip: req.ip });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        type: 'user_token'
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

    // Log user activity
    await userService.addActivityLog(user.id, {
      action: 'login',
      details: 'User logged in successfully',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          permissions: user.permissions
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
  getProtectedData,
  initializeDefaultUsers
};
