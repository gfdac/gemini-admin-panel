const Joi = require('joi');
const logger = require('../utils/logger');

// PROMPT PARA COPILOT: Gerar middlewares de validação usando Joi aqui

// Validation for login request
const validateLoginRequest = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    logger.warn('Login validation failed', { 
      error: error.details[0].message,
      ip: req.ip 
    });
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input data',
      details: error.details[0].message
    });
  }

  next();
};

// Validation for Gemini request
const validateGeminiRequest = (req, res, next) => {
  const schema = Joi.object({
    prompt: Joi.string().min(3).max(10000).required(),
    temperature: Joi.number().min(0).max(1).optional(),
    maxOutputTokens: Joi.number().min(1).max(4096).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    logger.warn('Gemini request validation failed', { 
      error: error.details[0].message,
      userId: req.user?.id,
      ip: req.ip 
    });
    return res.status(400).json({
      status: 'error',
      message: 'Invalid prompt data',
      details: error.details[0].message
    });
  }

  next();
};

// Generic validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation failed', { 
        error: error.details[0].message,
        path: req.path,
        ip: req.ip 
      });
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: error.details[0].message
      });
    }

    next();
  };
};

module.exports = {
  validateLoginRequest,
  validateGeminiRequest,
  validate
};
