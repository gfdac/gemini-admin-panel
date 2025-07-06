const { geminiKeysService } = require('../services/geminiService');
const logger = require('../utils/logger');

// Listar todas as chaves
const listKeys = async (req, res) => {
  try {
    const keys = await geminiKeysService.listKeys();
    const stats = await geminiKeysService.getKeyStats();
    
    res.json({
      success: true,
      data: {
        keys,
        stats
      }
    });
  } catch (error) {
    logger.error('Failed to list Gemini keys', {
      error: error.message,
      user: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Gemini API keys'
    });
  }
};

// Adicionar nova chave
const addKey = async (req, res) => {
  try {
    const { key, name, active = true } = req.body;
    
    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    const newKey = await geminiKeysService.addKey({
      key: key.trim(),
      name: name || `API Key ${Date.now()}`,
      active
    });
    
    logger.info('New Gemini API key added', {
      keyId: newKey.id,
      user: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      data: newKey
    });
  } catch (error) {
    logger.error('Failed to add Gemini key', {
      error: error.message,
      user: req.user?.id
    });
    
    let statusCode = 500;
    let errorMessage = 'Failed to add API key';
    
    if (error.message.includes('already exists')) {
      statusCode = 409;
      errorMessage = 'This API key already exists';
    } else if (error.message.includes('Redis not available')) {
      statusCode = 503;
      errorMessage = 'Key management service unavailable';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

// Remover chave
const removeKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    
    if (!keyId) {
      return res.status(400).json({
        success: false,
        error: 'Key ID is required'
      });
    }
    
    await geminiKeysService.removeKey(keyId);
    
    logger.info('Gemini API key removed', {
      keyId,
      user: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'API key removed successfully'
    });
  } catch (error) {
    logger.error('Failed to remove Gemini key', {
      error: error.message,
      keyId: req.params.keyId,
      user: req.user?.id
    });
    
    let statusCode = 500;
    let errorMessage = 'Failed to remove API key';
    
    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'API key not found';
    } else if (error.message.includes('Redis not available')) {
      statusCode = 503;
      errorMessage = 'Key management service unavailable';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

// Ativar/desativar chave
const toggleKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { active } = req.body;
    
    if (!keyId) {
      return res.status(400).json({
        success: false,
        error: 'Key ID is required'
      });
    }
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Active status must be a boolean'
      });
    }
    
    const updatedKey = await geminiKeysService.toggleKey(keyId, active);
    
    logger.info('Gemini API key toggled', {
      keyId,
      active,
      user: req.user?.id
    });
    
    res.json({
      success: true,
      data: {
        id: updatedKey.id,
        name: updatedKey.name,
        active: updatedKey.active
      }
    });
  } catch (error) {
    logger.error('Failed to toggle Gemini key', {
      error: error.message,
      keyId: req.params.keyId,
      user: req.user?.id
    });
    
    let statusCode = 500;
    let errorMessage = 'Failed to toggle API key';
    
    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'API key not found';
    } else if (error.message.includes('Redis not available')) {
      statusCode = 503;
      errorMessage = 'Key management service unavailable';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

// Obter estatísticas das chaves
const getKeyStats = async (req, res) => {
  try {
    const stats = await geminiKeysService.getKeyStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get key stats', {
      error: error.message,
      user: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve key statistics'
    });
  }
};

// Testar conectividade com uma chave específica
const testKey = async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        error: 'API key is required for testing'
      });
    }
    
    // Fazer uma chamada de teste diretamente com a chave fornecida
    const axios = require('axios');
    const testResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.trim()}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Hello! Please respond with just "API key is working" to confirm connectivity.'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    const isWorking = testResponse.data && 
                     testResponse.data.candidates && 
                     testResponse.data.candidates.length > 0;
    
    logger.info('Gemini API key test completed', {
      success: isWorking,
      user: req.user?.id
    });
    
    res.json({
      success: true,
      data: {
        valid: isWorking,
        message: isWorking ? 'API key is working correctly' : 'API key test failed'
      }
    });
  } catch (error) {
    logger.error('Gemini API key test failed', {
      error: error.message,
      status: error.response?.status,
      user: req.user?.id
    });
    
    let message = 'API key test failed';
    if (error.response?.status === 401) {
      message = 'Invalid API key';
    } else if (error.response?.status === 403) {
      message = 'API key does not have required permissions';
    } else if (error.response?.status === 429) {
      message = 'API key rate limit exceeded';
    }
    
    res.json({
      success: true,
      data: {
        valid: false,
        message,
        statusCode: error.response?.status
      }
    });
  }
};

module.exports = {
  listKeys,
  addKey,
  removeKey,
  toggleKey,
  getKeyStats,
  testKey
};
