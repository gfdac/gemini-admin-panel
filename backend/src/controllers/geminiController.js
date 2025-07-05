const { callGeminiAPI } = require('../services/geminiService');
const logger = require('../utils/logger');

// PROMPT PARA COPILOT: Criar controller processGeminiRequest que orquestra a chamada ao serviço Gemini 
// e retorna a resposta formatada (status, data, originalPrompt, geminiResponse, timestamp)

const processGeminiRequest = async (req, res) => {
  try {
    const { prompt, temperature, maxOutputTokens } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    logger.info('Gemini request started', {
      userId,
      username,
      promptLength: prompt.length,
      temperature,
      maxOutputTokens
    });

    const startTime = Date.now();

    // Call Gemini API through service
    const geminiResult = await callGeminiAPI(prompt, {
      temperature,
      maxOutputTokens
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    if (geminiResult.success) {
      logger.info('Gemini request successful', {
        userId,
        username,
        processingTime,
        responseLength: geminiResult.response.length
      });

      res.json({
        status: 'success',
        message: 'Gemini response generated successfully',
        data: {
          originalPrompt: prompt,
          geminiResponse: geminiResult.response,
          metadata: {
            ...geminiResult.metadata,
            processingTime,
            userId,
            username,
            timestamp: new Date().toISOString()
          }
        }
      });
    } else {
      logger.error('Gemini request failed', {
        userId,
        username,
        error: geminiResult.error,
        statusCode: geminiResult.statusCode,
        processingTime
      });

      res.status(geminiResult.statusCode || 500).json({
        status: 'error',
        message: geminiResult.error || 'Failed to generate response',
        data: {
          originalPrompt: prompt,
          error: geminiResult.error,
          timestamp: new Date().toISOString(),
          processingTime
        }
      });
    }

  } catch (error) {
    logger.error('Gemini controller error', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    res.status(500).json({
      status: 'error',
      message: 'Internal server error while processing Gemini request',
      data: {
        originalPrompt: req.body.prompt,
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
};

// Get user's Gemini usage statistics (bonus feature)
const getGeminiStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    // In a real application, you would fetch this from a database
    const mockStats = {
      totalRequests: 42,
      totalTokensUsed: 15680,
      averageResponseTime: 2.3,
      lastRequestTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      favoriteTopics: ['coding', 'AI', 'science']
    };

    logger.info('Gemini stats requested', { userId, username });

    res.json({
      status: 'success',
      message: 'Gemini usage statistics retrieved',
      data: {
        user: {
          id: userId,
          username
        },
        stats: mockStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Gemini stats error', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve Gemini statistics'
    });
  }
};

module.exports = {
  processGeminiRequest,
  getGeminiStats
};
