const { callGeminiAPI } = require('../services/geminiService');
const logger = require('../utils/logger');
const userService = require('../services/userService');
const requestService = require('../services/requestService');

// PROMPT PARA COPILOT: Controller para processar requisições ao Gemini com logging real

const processGeminiRequest = async (req, res) => {
  const startTime = Date.now();
  let requestId = null;
  
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

    // Check user API usage and limits
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.apiUsed >= user.apiLimit) {
      const responseTime = Date.now() - startTime;
      
      // Log failed request
      await requestService.logRequest({
        userId,
        username,
        endpoint: '/api/gemini',
        status: 'error',
        statusCode: 429,
        responseTime,
        prompt,
        error: 'API usage limit exceeded',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(429).json({
        status: 'error',
        message: 'API usage limit exceeded',
        data: {
          currentUsage: user.apiUsed,
          limit: user.apiLimit,
          resetDate: user.plan === 'free' ? 'Monthly reset' : 'Contact admin'
        }
      });
    }

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt, {
      temperature,
      maxOutputTokens
    });

    const responseTime = Date.now() - startTime;
    const tokens = geminiResponse.usageMetadata?.totalTokenCount || 0;

    // Update user API usage
    await userService.incrementApiUsage(userId, tokens);

    // Update user stats
    await userService.updateUserStats(userId, {
      lastRequestTime: new Date().toISOString()
    });

    // Log successful request
    const logEntry = await requestService.logRequest({
      userId,
      username,
      endpoint: '/api/gemini',
      status: 'success',
      statusCode: 200,
      responseTime,
      prompt,
      response: geminiResponse.text,
      model: 'gemini-1.5-flash',
      tokens,
      inputTokens: geminiResponse.usageMetadata?.promptTokenCount || 0,
      outputTokens: geminiResponse.usageMetadata?.candidatesTokenCount || 0,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID
    });

    requestId = logEntry.id;

    // Add user activity
    await userService.addActivityLog(userId, {
      action: 'gemini_request',
      details: `Made Gemini request with ${prompt.length} characters`,
      metadata: {
        tokens,
        responseTime,
        model: 'gemini-1.5-flash'
      }
    });

    logger.info('Gemini request completed', {
      userId,
      username,
      requestId,
      responseTime,
      tokens,
      success: true
    });

    res.json({
      status: 'success',
      message: 'Gemini request processed successfully',
      data: {
        originalPrompt: prompt,
        geminiResponse: geminiResponse.text,
        timestamp: new Date().toISOString(),
        requestId,
        usage: {
          tokens,
          inputTokens: geminiResponse.usageMetadata?.promptTokenCount || 0,
          outputTokens: geminiResponse.usageMetadata?.candidatesTokenCount || 0,
          responseTime
        },
        userUsage: {
          current: user.apiUsed + 1,
          limit: user.apiLimit,
          remaining: user.apiLimit - (user.apiUsed + 1)
        }
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log failed request
    if (req.user) {
      await requestService.logRequest({
        userId: req.user.id,
        username: req.user.username,
        endpoint: '/api/gemini',
        status: 'error',
        statusCode: 500,
        responseTime,
        prompt: req.body.prompt,
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(logError => {
        logger.error('Failed to log failed request', { logError: logError.message });
      });
    }

    logger.error('Gemini request failed', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      responseTime
    });

    res.status(500).json({
      status: 'error',
      message: 'Internal server error while processing Gemini request',
      data: {
        originalPrompt: req.body.prompt,
        timestamp: new Date().toISOString(),
        requestId,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
};

// Get user's Gemini usage statistics
const getGeminiStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    // Get user stats from Redis
    const userStats = await userService.getUserStats(userId);
    const user = await userService.getUserById(userId);

    // Get recent requests
    const recentRequests = await requestService.getUserRequestHistory(userId, 10);

    const stats = {
      totalRequests: userStats.totalRequests,
      totalTokensUsed: userStats.tokensUsed,
      averageResponseTime: userStats.avgResponseTime,
      lastRequestTime: userStats.lastRequestTime,
      favoriteModels: userStats.favoriteModels || ['gemini-1.5-flash'],
      successRate: userStats.totalRequests > 0 ? 
        ((userStats.successCount / userStats.totalRequests) * 100).toFixed(1) : '100',
      currentUsage: user?.apiUsed || 0,
      usageLimit: user?.apiLimit || 1000,
      usagePercentage: user ? ((user.apiUsed / user.apiLimit) * 100).toFixed(1) : '0',
      plan: user?.plan || 'free',
      recentRequests: recentRequests.map(req => ({
        id: req.id,
        timestamp: req.timestamp,
        status: req.status,
        responseTime: req.responseTime,
        tokens: req.tokens
      }))
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
        stats,
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
