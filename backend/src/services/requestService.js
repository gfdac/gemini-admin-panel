const redisService = require('../config/redis');
const logger = require('../utils/logger');

class RequestService {
  constructor() {
    this.REQUEST_PREFIX = 'request:';
    this.REQUESTS_LIST = 'requests:list';
    this.REQUEST_STATS = 'request:stats';
    this.DAILY_STATS_PREFIX = 'daily:stats:';
  }

  // Generate request ID
  generateRequestId() {
    return 'req_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Log request
  async logRequest(requestData) {
    try {
      const requestId = this.generateRequestId();
      const timestamp = new Date().toISOString();
      
      const logEntry = {
        id: requestId,
        timestamp,
        userId: requestData.userId,
        username: requestData.username,
        method: requestData.method || 'POST',
        endpoint: requestData.endpoint,
        status: requestData.status,
        statusCode: requestData.statusCode,
        responseTime: requestData.responseTime,
        requestSize: requestData.requestSize || 0,
        responseSize: requestData.responseSize || 0,
        userAgent: requestData.userAgent,
        ip: requestData.ip,
        model: requestData.model,
        tokens: requestData.tokens || 0,
        inputTokens: requestData.inputTokens || 0,
        outputTokens: requestData.outputTokens || 0,
        prompt: requestData.prompt ? requestData.prompt.substring(0, 500) : '', // Store first 500 chars
        response: requestData.response ? requestData.response.substring(0, 1000) : '', // Store first 1000 chars
        error: requestData.error,
        apiKey: requestData.apiKey ? `${requestData.apiKey.substring(0, 8)}...` : null, // Mask API key
        sessionId: requestData.sessionId,
        metadata: requestData.metadata || {}
      };

      // Save request log to Redis
      await redisService.set(`${this.REQUEST_PREFIX}${requestId}`, logEntry);
      
      // Add to requests list (keep only last 10000 requests)
      await redisService.lpush(this.REQUESTS_LIST, requestId);
      await redisService.ltrim(this.REQUESTS_LIST, 0, 9999);
      
      // Update statistics
      await this.updateRequestStats(logEntry);
      
      logger.debug('Request logged', { 
        requestId, 
        userId: requestData.userId,
        endpoint: requestData.endpoint,
        status: requestData.status
      });
      
      return logEntry;
      
    } catch (error) {
      logger.error('Error logging request', {
        userId: requestData.userId,
        endpoint: requestData.endpoint,
        error: error.message
      });
      throw error;
    }
  }

  // Get request by ID
  async getRequestById(requestId) {
    try {
      const request = await redisService.get(`${this.REQUEST_PREFIX}${requestId}`);
      return request;
    } catch (error) {
      logger.error('Error getting request by ID', { requestId, error: error.message });
      throw error;
    }
  }

  // Get requests with filters
  async getRequests(options = {}) {
    try {
      const { 
        userId, 
        status, 
        endpoint, 
        startDate, 
        endDate, 
        limit = 50, 
        offset = 0 
      } = options;

      const requestIds = await redisService.lrange(this.REQUESTS_LIST, 0, -1);
      const requests = [];

      for (const requestId of requestIds) {
        const request = await redisService.get(`${this.REQUEST_PREFIX}${requestId}`);
        if (!request) continue;

        // Apply filters
        if (userId && request.userId !== userId) continue;
        if (status && request.status !== status) continue;
        if (endpoint && !request.endpoint.includes(endpoint)) continue;
        
        if (startDate) {
          const requestDate = new Date(request.timestamp);
          if (requestDate < new Date(startDate)) continue;
        }
        
        if (endDate) {
          const requestDate = new Date(request.timestamp);
          if (requestDate > new Date(endDate)) continue;
        }

        requests.push(request);
      }

      // Sort by timestamp (newest first)
      requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply pagination
      const total = requests.length;
      const paginatedRequests = requests.slice(offset, offset + limit);

      logger.debug('Requests retrieved', { 
        total, 
        returned: paginatedRequests.length,
        filters: { userId, status, endpoint, startDate, endDate }
      });

      return {
        requests: paginatedRequests,
        total,
        limit,
        offset
      };

    } catch (error) {
      logger.error('Error getting requests', { error: error.message });
      throw error;
    }
  }

  // Update request statistics
  async updateRequestStats(logEntry) {
    try {
      // Get current stats
      let stats = await redisService.get(this.REQUEST_STATS);
      if (!stats) {
        stats = {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalTokens: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          totalRequestSize: 0,
          totalResponseSize: 0,
          endpointStats: {},
          statusStats: {},
          modelStats: {},
          errorStats: {},
          lastUpdated: new Date().toISOString()
        };
      }

      // Update counters
      stats.totalRequests += 1;
      stats.totalTokens += logEntry.tokens;
      stats.totalResponseTime += logEntry.responseTime;
      stats.totalRequestSize += logEntry.requestSize;
      stats.totalResponseSize += logEntry.responseSize;

      // Calculate average response time
      stats.avgResponseTime = stats.totalResponseTime / stats.totalRequests;

      // Update success/failure counts
      if (logEntry.status === 'success') {
        stats.successfulRequests += 1;
      } else {
        stats.failedRequests += 1;
      }

      // Update endpoint stats
      if (!stats.endpointStats[logEntry.endpoint]) {
        stats.endpointStats[logEntry.endpoint] = {
          count: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          errors: 0
        };
      }
      
      const endpointStat = stats.endpointStats[logEntry.endpoint];
      endpointStat.count += 1;
      endpointStat.totalResponseTime += logEntry.responseTime;
      endpointStat.avgResponseTime = endpointStat.totalResponseTime / endpointStat.count;
      
      if (logEntry.status !== 'success') {
        endpointStat.errors += 1;
      }

      // Update status code stats
      const statusCode = logEntry.statusCode.toString();
      stats.statusStats[statusCode] = (stats.statusStats[statusCode] || 0) + 1;

      // Update model stats
      if (logEntry.model) {
        if (!stats.modelStats[logEntry.model]) {
          stats.modelStats[logEntry.model] = {
            count: 0,
            totalTokens: 0,
            avgTokens: 0
          };
        }
        
        const modelStat = stats.modelStats[logEntry.model];
        modelStat.count += 1;
        modelStat.totalTokens += logEntry.tokens;
        modelStat.avgTokens = modelStat.totalTokens / modelStat.count;
      }

      // Update error stats
      if (logEntry.error) {
        const errorType = logEntry.error.substring(0, 50); // First 50 chars of error
        stats.errorStats[errorType] = (stats.errorStats[errorType] || 0) + 1;
      }

      stats.lastUpdated = new Date().toISOString();

      // Save updated stats
      await redisService.set(this.REQUEST_STATS, stats);

      // Update daily stats
      await this.updateDailyStats(logEntry);
      
      logger.debug('Request stats updated', { totalRequests: stats.totalRequests });
      
    } catch (error) {
      logger.error('Error updating request stats', { error: error.message });
      throw error;
    }
  }

  // Update daily statistics
  async updateDailyStats(logEntry) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const statsKey = `${this.DAILY_STATS_PREFIX}${today}`;
      
      let dailyStats = await redisService.get(statsKey);
      if (!dailyStats) {
        dailyStats = {
          date: today,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalTokens: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          uniqueUsers: new Set(),
          topEndpoints: {},
          topModels: {},
          hourlyStats: Array(24).fill(0)
        };
      }

      // Convert Set back from Redis (it's stored as array)
      if (Array.isArray(dailyStats.uniqueUsers)) {
        dailyStats.uniqueUsers = new Set(dailyStats.uniqueUsers);
      }

      // Update daily counters
      dailyStats.totalRequests += 1;
      dailyStats.totalTokens += logEntry.tokens;
      dailyStats.totalResponseTime += logEntry.responseTime;

      if (logEntry.status === 'success') {
        dailyStats.successfulRequests += 1;
      } else {
        dailyStats.failedRequests += 1;
      }

      // Add unique user
      if (logEntry.userId) {
        dailyStats.uniqueUsers.add(logEntry.userId);
      }

      // Update hourly stats
      const hour = new Date(logEntry.timestamp).getHours();
      dailyStats.hourlyStats[hour] += 1;

      // Update top endpoints
      dailyStats.topEndpoints[logEntry.endpoint] = (dailyStats.topEndpoints[logEntry.endpoint] || 0) + 1;

      // Update top models
      if (logEntry.model) {
        dailyStats.topModels[logEntry.model] = (dailyStats.topModels[logEntry.model] || 0) + 1;
      }

      // Calculate average response time
      dailyStats.avgResponseTime = dailyStats.totalResponseTime / dailyStats.totalRequests;

      // Convert Set to Array for Redis storage
      const statsToSave = {
        ...dailyStats,
        uniqueUsers: Array.from(dailyStats.uniqueUsers)
      };

      // Save daily stats with 30 day expiration
      await redisService.set(statsKey, statsToSave, 30 * 24 * 3600); // 30 days TTL
      
      logger.debug('Daily stats updated', { date: today, totalRequests: dailyStats.totalRequests });
      
    } catch (error) {
      logger.error('Error updating daily stats', { error: error.message });
      throw error;
    }
  }

  // Get general statistics
  async getGeneralStats() {
    try {
      const stats = await redisService.get(this.REQUEST_STATS);
      
      if (!stats) {
        return {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalTokens: 0,
          avgResponseTime: 0,
          successRate: 0,
          errorRate: 0,
          lastUpdated: null
        };
      }

      const successRate = stats.totalRequests > 0 ? 
        (stats.successfulRequests / stats.totalRequests) * 100 : 0;
      const errorRate = 100 - successRate;

      return {
        ...stats,
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100
      };
      
    } catch (error) {
      logger.error('Error getting general stats', { error: error.message });
      throw error;
    }
  }

  // Get daily statistics for a range
  async getDailyStats(startDate, endDate, limit = 30) {
    try {
      const stats = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const statsKey = `${this.DAILY_STATS_PREFIX}${dateStr}`;
        
        const dailyStats = await redisService.get(statsKey);
        if (dailyStats) {
          // Convert uniqueUsers array back to count
          if (Array.isArray(dailyStats.uniqueUsers)) {
            dailyStats.uniqueUsersCount = dailyStats.uniqueUsers.length;
            delete dailyStats.uniqueUsers; // Remove array to reduce payload
          }
          stats.push(dailyStats);
        } else {
          // Add empty stats for missing days
          stats.push({
            date: dateStr,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalTokens: 0,
            avgResponseTime: 0,
            uniqueUsersCount: 0
          });
        }
        
        if (stats.length >= limit) break;
      }
      
      return stats;
      
    } catch (error) {
      logger.error('Error getting daily stats', { startDate, endDate, error: error.message });
      throw error;
    }
  }

  // Get user request history
  async getUserRequestHistory(userId, limit = 20) {
    try {
      const result = await this.getRequests({ userId, limit });
      return result.requests;
    } catch (error) {
      logger.error('Error getting user request history', { userId, error: error.message });
      throw error;
    }
  }

  // Delete old requests (cleanup)
  async cleanupOldRequests(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const requestIds = await redisService.lrange(this.REQUESTS_LIST, 0, -1);
      let deletedCount = 0;

      for (const requestId of requestIds) {
        const request = await redisService.get(`${this.REQUEST_PREFIX}${requestId}`);
        if (request && new Date(request.timestamp) < cutoffDate) {
          await redisService.del(`${this.REQUEST_PREFIX}${requestId}`);
          deletedCount++;
        }
      }

      // Rebuild the list without deleted items
      if (deletedCount > 0) {
        await redisService.del(this.REQUESTS_LIST);
        const remainingIds = [];
        
        for (const requestId of requestIds) {
          const exists = await redisService.exists(`${this.REQUEST_PREFIX}${requestId}`);
          if (exists) {
            remainingIds.push(requestId);
          }
        }
        
        if (remainingIds.length > 0) {
          await redisService.lpush(this.REQUESTS_LIST, ...remainingIds);
        }
      }

      logger.info('Request cleanup completed', { 
        deletedCount, 
        daysToKeep,
        cutoffDate: cutoffDate.toISOString()
      });
      
      return deletedCount;
      
    } catch (error) {
      logger.error('Error cleaning up old requests', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RequestService();
