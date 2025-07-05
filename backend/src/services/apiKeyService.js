const redisService = require('../config/redis');
const logger = require('../utils/logger');

class ApiKeyService {
  constructor() {
    this.API_KEY_PREFIX = 'api_key:';
    this.API_KEYS_LIST = 'api_keys:list';
    this.API_KEY_STATS_PREFIX = 'api_key:stats:';
    this.API_KEY_USAGE_PREFIX = 'api_key:usage:';
  }

  // Generate API Key ID
  generateApiKeyId() {
    return 'ak_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Generate API Key
  generateApiKey() {
    return 'gk_' + Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
  }

  // Create API Key
  async createApiKey(keyData) {
    try {
      const keyId = this.generateApiKeyId();
      const apiKey = this.generateApiKey();
      
      const apiKeyObject = {
        id: keyId,
        key: apiKey,
        name: keyData.name,
        description: keyData.description || '',
        status: keyData.status || 'active',
        environment: keyData.environment || 'production',
        region: keyData.region || 'global',
        priority: keyData.priority || 'normal',
        rateLimit: keyData.rateLimit || 1000,
        rateLimitWindow: keyData.rateLimitWindow || 3600, // 1 hour in seconds
        allowedModels: keyData.allowedModels || ['gemini-1.5-flash', 'gemini-1.5-pro'],
        permissions: keyData.permissions || ['chat', 'text-generation'],
        createdAt: new Date().toISOString(),
        createdBy: keyData.createdBy,
        lastUsed: null,
        totalRequests: 0,
        totalTokens: 0,
        lastRotated: null,
        autoRotate: keyData.autoRotate || false,
        rotationInterval: keyData.rotationInterval || 90, // days
        tags: keyData.tags || [],
        metadata: keyData.metadata || {}
      };

      // Save API key to Redis
      await redisService.set(`${this.API_KEY_PREFIX}${keyId}`, apiKeyObject);
      
      // Add to API keys list
      await redisService.lpush(this.API_KEYS_LIST, keyId);
      
      // Initialize API key stats
      await this.initializeApiKeyStats(keyId);
      
      logger.info('API key created', { keyId, name: keyData.name, createdBy: keyData.createdBy });
      
      return apiKeyObject;
      
    } catch (error) {
      logger.error('Error creating API key', {
        name: keyData.name,
        error: error.message
      });
      throw error;
    }
  }

  // Get API key by ID
  async getApiKeyById(keyId) {
    try {
      const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
      return apiKey;
    } catch (error) {
      logger.error('Error getting API key by ID', { keyId, error: error.message });
      throw error;
    }
  }

  // Get API key by key value
  async getApiKeyByKey(key) {
    try {
      const keyIds = await redisService.lrange(this.API_KEYS_LIST, 0, -1);
      
      for (const keyId of keyIds) {
        const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
        if (apiKey && apiKey.key === key) {
          return apiKey;
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting API key by key', { error: error.message });
      throw error;
    }
  }

  // Get all API keys
  async getAllApiKeys(options = {}) {
    try {
      const { status, environment, region, limit = 100, offset = 0 } = options;
      const keyIds = await redisService.lrange(this.API_KEYS_LIST, 0, -1);
      const apiKeys = [];

      for (const keyId of keyIds) {
        const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
        if (!apiKey) continue;

        // Apply filters
        if (status && apiKey.status !== status) continue;
        if (environment && apiKey.environment !== environment) continue;
        if (region && apiKey.region !== region) continue;

        apiKeys.push(apiKey);
      }

      // Apply pagination
      const total = apiKeys.length;
      const paginatedKeys = apiKeys.slice(offset, offset + limit);

      logger.debug('API keys retrieved', { 
        total, 
        returned: paginatedKeys.length,
        filters: { status, environment, region }
      });

      return {
        apiKeys: paginatedKeys,
        total,
        limit,
        offset
      };

    } catch (error) {
      logger.error('Error getting all API keys', { error: error.message });
      throw error;
    }
  }

  // Update API key
  async updateApiKey(keyId, updateData) {
    try {
      const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const updatedApiKey = {
        ...apiKey,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await redisService.set(`${this.API_KEY_PREFIX}${keyId}`, updatedApiKey);
      
      logger.info('API key updated', { keyId, fields: Object.keys(updateData) });
      
      return updatedApiKey;
      
    } catch (error) {
      logger.error('Error updating API key', { keyId, error: error.message });
      throw error;
    }
  }

  // Delete API key
  async deleteApiKey(keyId) {
    try {
      const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Remove API key data
      await redisService.del(`${this.API_KEY_PREFIX}${keyId}`);
      await redisService.del(`${this.API_KEY_STATS_PREFIX}${keyId}`);
      await redisService.del(`${this.API_KEY_USAGE_PREFIX}${keyId}`);
      
      // Remove from API keys list
      const keyIds = await redisService.lrange(this.API_KEYS_LIST, 0, -1);
      const filteredIds = keyIds.filter(id => id !== keyId);
      await redisService.del(this.API_KEYS_LIST);
      if (filteredIds.length > 0) {
        await redisService.lpush(this.API_KEYS_LIST, ...filteredIds);
      }
      
      logger.info('API key deleted', { keyId, name: apiKey.name });
      return true;
      
    } catch (error) {
      logger.error('Error deleting API key', { keyId, error: error.message });
      throw error;
    }
  }

  // Initialize API key stats
  async initializeApiKeyStats(keyId) {
    try {
      const stats = {
        totalRequests: 0,
        totalTokens: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        dailyRequests: Array(7).fill(0),
        hourlyRequests: Array(24).fill(0),
        modelUsage: {},
        errorRate: 0,
        lastUsed: null,
        peakUsageHour: 0,
        peakUsageDay: 0
      };

      await redisService.set(`${this.API_KEY_STATS_PREFIX}${keyId}`, stats);
      
      logger.debug('API key stats initialized', { keyId });
      return stats;
      
    } catch (error) {
      logger.error('Error initializing API key stats', { keyId, error: error.message });
      throw error;
    }
  }

  // Get API key stats
  async getApiKeyStats(keyId) {
    try {
      const stats = await redisService.get(`${this.API_KEY_STATS_PREFIX}${keyId}`);
      return stats || await this.initializeApiKeyStats(keyId);
    } catch (error) {
      logger.error('Error getting API key stats', { keyId, error: error.message });
      throw error;
    }
  }

  // Update API key usage
  async updateApiKeyUsage(keyId, usageData) {
    try {
      const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Update API key last used
      apiKey.lastUsed = new Date().toISOString();
      apiKey.totalRequests = (apiKey.totalRequests || 0) + 1;
      apiKey.totalTokens = (apiKey.totalTokens || 0) + (usageData.tokens || 0);

      await redisService.set(`${this.API_KEY_PREFIX}${keyId}`, apiKey);

      // Update stats
      const stats = await this.getApiKeyStats(keyId);
      stats.totalRequests += 1;
      stats.totalTokens += (usageData.tokens || 0);
      stats.lastUsed = new Date().toISOString();

      if (usageData.success) {
        stats.successfulRequests += 1;
      } else {
        stats.failedRequests += 1;
      }

      // Update daily and hourly requests
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();
      
      stats.dailyRequests[dayOfWeek] += 1;
      stats.hourlyRequests[hour] += 1;

      // Update model usage
      if (usageData.model) {
        stats.modelUsage[usageData.model] = (stats.modelUsage[usageData.model] || 0) + 1;
      }

      // Calculate error rate
      const totalReqs = stats.successfulRequests + stats.failedRequests;
      stats.errorRate = totalReqs > 0 ? (stats.failedRequests / totalReqs) * 100 : 0;

      // Update response time
      if (usageData.responseTime) {
        const totalTime = stats.avgResponseTime * (stats.totalRequests - 1) + usageData.responseTime;
        stats.avgResponseTime = totalTime / stats.totalRequests;
      }

      await redisService.set(`${this.API_KEY_STATS_PREFIX}${keyId}`, stats);
      
      logger.debug('API key usage updated', { keyId, tokens: usageData.tokens });
      return stats;
      
    } catch (error) {
      logger.error('Error updating API key usage', { keyId, error: error.message });
      throw error;
    }
  }

  // Rotate API key
  async rotateApiKey(keyId) {
    try {
      const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const oldKey = apiKey.key;
      const newKey = this.generateApiKey();

      apiKey.key = newKey;
      apiKey.lastRotated = new Date().toISOString();

      await redisService.set(`${this.API_KEY_PREFIX}${keyId}`, apiKey);
      
      logger.info('API key rotated', { keyId, name: apiKey.name });
      
      return {
        ...apiKey,
        oldKey // Return old key for transition period
      };
      
    } catch (error) {
      logger.error('Error rotating API key', { keyId, error: error.message });
      throw error;
    }
  }

  // Validate API key
  async validateApiKey(key) {
    try {
      const apiKey = await this.getApiKeyByKey(key);
      
      if (!apiKey) {
        return { valid: false, reason: 'Key not found' };
      }

      if (apiKey.status !== 'active') {
        return { valid: false, reason: 'Key is not active' };
      }

      // Check rate limiting
      const stats = await this.getApiKeyStats(apiKey.id);
      const now = Date.now();
      const windowStart = now - (apiKey.rateLimitWindow * 1000);
      
      // Simple rate limiting check (in real implementation, use sliding window)
      if (stats.totalRequests >= apiKey.rateLimit) {
        const shouldReset = !stats.lastUsed || new Date(stats.lastUsed).getTime() < windowStart;
        if (!shouldReset) {
          return { valid: false, reason: 'Rate limit exceeded' };
        }
      }

      return { 
        valid: true, 
        apiKey,
        stats 
      };
      
    } catch (error) {
      logger.error('Error validating API key', { error: error.message });
      return { valid: false, reason: 'Validation error' };
    }
  }

  // Get API key count
  async getApiKeyCount() {
    try {
      const keyIds = await redisService.lrange(this.API_KEYS_LIST, 0, -1);
      return keyIds.length;
    } catch (error) {
      logger.error('Error getting API key count', { error: error.message });
      return 0;
    }
  }

  // Get active API keys count
  async getActiveApiKeysCount() {
    try {
      const keyIds = await redisService.lrange(this.API_KEYS_LIST, 0, -1);
      let activeCount = 0;

      for (const keyId of keyIds) {
        const apiKey = await redisService.get(`${this.API_KEY_PREFIX}${keyId}`);
        if (apiKey && apiKey.status === 'active') {
          activeCount++;
        }
      }

      return activeCount;
    } catch (error) {
      logger.error('Error getting active API keys count', { error: error.message });
      return 0;
    }
  }

  // Get usage statistics
  async getUsageStatistics(timeframe = '24h') {
    try {
      const keyIds = await redisService.lrange(this.API_KEYS_LIST, 0, -1);
      let totalRequests = 0;
      let totalTokens = 0;
      let totalErrors = 0;

      for (const keyId of keyIds) {
        const stats = await this.getApiKeyStats(keyId);
        totalRequests += stats.totalRequests;
        totalTokens += stats.totalTokens;
        totalErrors += stats.failedRequests;
      }

      const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

      return {
        totalRequests,
        totalTokens,
        totalErrors,
        errorRate,
        successRate: 100 - errorRate,
        activeKeys: await this.getActiveApiKeysCount(),
        totalKeys: await this.getApiKeyCount()
      };
      
    } catch (error) {
      logger.error('Error getting usage statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ApiKeyService();
